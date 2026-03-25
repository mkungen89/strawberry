export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/nextjs";
import { BOT_CONFIGS } from "@/lib/telegram-bots";
import {
  parseConsultRequest,
  stripConsultMarkers,
  consultBot,
  generateFinalResponse,
} from "@/lib/bot-to-bot";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// ─── Rate limiting (in-memory) ────────────────────────────────────────────────

const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

// ─── Conversation history (in-memory) ────────────────────────────────────────

type ConvMsg = { role: "user" | "assistant"; content: string };

const convHistory = new Map<string, ConvMsg[]>();
const convTimestamps = new Map<string, number>();
const MAX_HISTORY = 10;
const HISTORY_TTL_MS = 30 * 60_000;

function getHistory(key: string): ConvMsg[] {
  const ts = convTimestamps.get(key) ?? 0;
  if (Date.now() - ts > HISTORY_TTL_MS) {
    convHistory.delete(key);
    convTimestamps.delete(key);
    return [];
  }
  return convHistory.get(key) ?? [];
}

function pushHistory(key: string, role: "user" | "assistant", content: string) {
  const history = getHistory(key);
  history.push({ role, content });
  if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
  convHistory.set(key, history);
  convTimestamps.set(key, Date.now());
}

// ─── Telegram API helpers ─────────────────────────────────────────────────────

async function sendMessage(
  token: string,
  chatId: number,
  text: string,
  replyTo?: number,
): Promise<void> {
  const body: Record<string, unknown> = { chat_id: chatId, text };
  if (replyTo) body.reply_to_message_id = replyTo;

  for (const parseMode of ["Markdown", null]) {
    const payload = parseMode ? { ...body, parse_mode: parseMode } : body;
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) return;
    if (parseMode === null) {
      const err = await res.text();
      throw new Error(`Telegram sendMessage failed: ${err}`);
    }
  }
}

async function sendTyping(token: string, chatId: number): Promise<void> {
  await fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" }),
  }).catch(() => {});
}

// ─── Telegram types ───────────────────────────────────────────────────────────

interface TgUser   { id: number; is_bot?: boolean; first_name: string; username?: string }
interface TgMessage { message_id: number; from?: TgUser; chat: { id: number; type: string }; text?: string; date: number }
interface TgUpdate  { update_id: number; message?: TgMessage; edited_message?: TgMessage }

// ─── Webhook handler ──────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bot: string }> },
) {
  const { bot } = await params;
  const config = BOT_CONFIGS[bot.toLowerCase()];

  if (!config?.token) {
    return NextResponse.json({ error: "Unknown bot" }, { status: 404 });
  }

  // Verify webhook secret
  const incomingSecret = req.headers.get("x-telegram-bot-api-secret-token");
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret && incomingSecret !== expectedSecret) {
    console.warn(`[Telegram/${config.name}] Rejected: invalid secret`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let update: TgUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = update.message ?? update.edited_message;
  if (!message?.text || message.from?.is_bot) {
    return NextResponse.json({ ok: true });
  }

  const chatId  = message.chat.id;
  const text    = message.text.trim();
  const fromName = message.from
    ? [message.from.first_name, message.from.username ? `@${message.from.username}` : ""].filter(Boolean).join(" ")
    : "Unknown";

  console.log(`[Telegram/${config.name}] ${fromName} (chat ${chatId}): ${text.slice(0, 120)}`);

  // /start greeting
  if (text === "/start") {
    await sendMessage(config.token, chatId,
      `Hi! I'm ${config.name}, Vexcraft's ${config.role}. How can I help you today?`,
      message.message_id,
    ).catch(() => {});
    return NextResponse.json({ ok: true });
  }

  // Rate limit
  if (checkRateLimit(`${bot}:${chatId}`)) {
    console.warn(`[Telegram/${config.name}] Rate limited: chat ${chatId}`);
    await sendMessage(config.token, chatId,
      "Too many messages. Please wait a moment.",
      message.message_id,
    ).catch(() => {});
    return NextResponse.json({ ok: true });
  }

  await sendTyping(config.token, chatId);

  try {
    const histKey = `${bot}:${chatId}`;
    pushHistory(histKey, "user", text);
    const messages = getHistory(histKey);

    // ── Step 1: Generate draft response ───────────────────────────────────────
    const draftResponse = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 450, // extra room for optional CONSULT block
      system: config.systemPrompt,
      messages,
    });

    const draft = draftResponse.content[0]?.type === "text"
      ? draftResponse.content[0].text
      : null;

    if (!draft) throw new Error("Empty draft from Claude");

    // ── Step 2: Check for consultation request ────────────────────────────────
    const consultReq = parseConsultRequest(draft);
    let finalReply: string;

    if (consultReq) {
      console.log(
        `[Telegram/${config.name}] Wants to consult ${consultReq.toBot}: ` +
        `"${consultReq.question.slice(0, 80)}"`,
      );

      // Show typing while we consult
      await sendTyping(config.token, chatId);

      const consultation = await consultBot(bot, consultReq, text);

      if (consultation) {
        // ── Step 3: Generate final response integrating the consultation ───────
        await sendTyping(config.token, chatId);
        finalReply = await generateFinalResponse(bot, messages, draft, consultation);
        console.log(
          `[Telegram/${config.name}] Integrated input from ${consultation.toBot}`,
        );
      } else {
        // Consultation failed/timed out — use the draft without the marker
        finalReply = stripConsultMarkers(draft);
        console.warn(`[Telegram/${config.name}] Consultation failed, using standalone draft`);
      }
    } else {
      // No consultation needed
      finalReply = draft;
    }

    // Store clean response (no markers) in history
    const cleanReply = stripConsultMarkers(finalReply);
    pushHistory(histKey, "assistant", cleanReply);
    await sendMessage(config.token, chatId, cleanReply, message.message_id);

    console.log(
      `[Telegram/${config.name}] Replied to ${fromName} — ` +
      `${draftResponse.usage.input_tokens}in / ${draftResponse.usage.output_tokens}out tokens (draft)`,
    );
  } catch (error) {
    Sentry.captureException(error, {
      tags:  { bot: config.name, chatId: String(chatId) },
      extra: { fromName, text: text.slice(0, 200) },
    });
    console.error(`[Telegram/${config.name}] Error:`, error);
    await sendMessage(
      config.token, chatId,
      "I'm having issues right now. Please try again in a moment.",
      message.message_id,
    ).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
