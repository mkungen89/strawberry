/**
 * Bot-to-bot consultation system for the Vexcraft AI team.
 *
 * Flow:
 *  1. Bot A generates a draft response to the user.
 *  2. If the draft contains [CONSULT:botname]question[/CONSULT], this lib
 *     calls Bot B with that question and the original user context.
 *  3. Bot B returns a focused expert answer (no further chaining).
 *  4. Bot A receives Bot B's answer and generates a final user-facing reply.
 *
 * Circular call prevention: consultation calls are flagged so the receiving
 * bot never triggers another consultation (depth capped at 1).
 */

import Anthropic from "@anthropic-ai/sdk";
import { BOT_CONFIGS, ROUTING_MATRIX } from "@/lib/telegram-bots";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const CONSULT_TIMEOUT_MS = 5_000;
const CONSULT_MARKER_RE = /\[CONSULT:(\w+)\]([\s\S]*?)\[\/CONSULT\]/i;

// ─── Parsing helpers ──────────────────────────────────────────────────────────

export interface ConsultationRequest {
  toBot: string;
  question: string;
}

/** Extract the first [CONSULT:x]...[/CONSULT] block from a draft response. */
export function parseConsultRequest(draft: string): ConsultationRequest | null {
  const match = draft.match(CONSULT_MARKER_RE);
  if (!match) return null;
  return { toBot: match[1].toLowerCase(), question: match[2].trim() };
}

/** Remove all [CONSULT:...] markers from a string. */
export function stripConsultMarkers(text: string): string {
  return text.replace(/\[CONSULT:\w+\][\s\S]*?\[\/CONSULT\]/gi, "").trim();
}

// ─── Consultation ─────────────────────────────────────────────────────────────

export interface ConsultationResult {
  fromBot: string;
  toBot: string;
  question: string;
  answer: string;
}

/**
 * Ask a peer bot for specialist input.
 * Returns null if the target is not allowed, unavailable, or times out.
 */
export async function consultBot(
  fromBotKey: string,
  req: ConsultationRequest,
  userContext: string,
): Promise<ConsultationResult | null> {
  const { toBot: toBotKey, question } = req;
  const toConfig = BOT_CONFIGS[toBotKey];
  const fromConfig = BOT_CONFIGS[fromBotKey];

  // Guard: unknown bot
  if (!toConfig || !fromConfig) {
    console.warn(`[bot-to-bot] Unknown bot in consultation: ${fromBotKey} → ${toBotKey}`);
    return null;
  }

  // Guard: not in routing matrix
  const allowed = ROUTING_MATRIX[fromBotKey] ?? [];
  if (!allowed.includes(toBotKey)) {
    console.warn(`[bot-to-bot] ${fromBotKey} is not allowed to consult ${toBotKey}`);
    return null;
  }

  console.log(`[bot-to-bot] ${fromConfig.name} → ${toConfig.name}: "${question.slice(0, 80)}"`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONSULT_TIMEOUT_MS);

  try {
    // Strip the collaboration block from the consulted bot's prompt —
    // it must not trigger further consultations (depth = 1 max).
    const cleanPrompt = toConfig.systemPrompt
      .replace(/\*\*Team collaboration:\*\*[\s\S]*$/i, "")
      .trim();

    const consultPrompt = `${cleanPrompt}

You are being consulted by ${fromConfig.name} (${fromConfig.role}). Give a focused, expert response in under 150 words. Be direct and specific — your input will be used to enhance their reply to a user.`;

    const response = await anthropic.messages.create(
      {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: consultPrompt,
        messages: [
          {
            role: "user",
            content: `Context from ${fromConfig.name}: ${userContext}\n\nQuestion: ${question}`,
          },
        ],
      },
      { signal: controller.signal as AbortSignal },
    );

    const answer =
      response.content[0]?.type === "text"
        ? response.content[0].text.trim()
        : null;

    if (!answer) return null;

    console.log(
      `[bot-to-bot] ${toConfig.name} answered ${fromConfig.name} — ` +
        `${response.usage.input_tokens}in / ${response.usage.output_tokens}out tokens`,
    );

    return { fromBot: fromBotKey, toBot: toBotKey, question, answer };
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      console.warn(`[bot-to-bot] Consultation ${fromBotKey}→${toBotKey} timed out after ${CONSULT_TIMEOUT_MS}ms`);
    } else {
      console.error(`[bot-to-bot] Consultation ${fromBotKey}→${toBotKey} failed:`, error);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Final response generation ────────────────────────────────────────────────

type ConvMsg = { role: "user" | "assistant"; content: string };

/**
 * Generate the final user-facing response after a consultation has completed.
 *
 * Appends the consultation result as a synthetic user turn so Claude can
 * integrate the expert input naturally.
 */
export async function generateFinalResponse(
  botKey: string,
  history: ConvMsg[],
  draft: string,
  consultation: ConsultationResult,
): Promise<string> {
  const fromConfig = BOT_CONFIGS[botKey]!;
  const toConfig = BOT_CONFIGS[consultation.toBot]!;

  const cleanDraft = stripConsultMarkers(draft);

  const messagesWithConsult: ConvMsg[] = [
    ...history.slice(0, -1), // exclude the last user turn (will be re-added)
    history[history.length - 1]!, // original user question
    { role: "assistant", content: cleanDraft },
    {
      role: "user",
      content:
        `[${toConfig.name} — ${toConfig.role} — internal team input]: ${consultation.answer}\n\n` +
        `Now give your final response to the user, naturally integrating this input where relevant. ` +
        `Do not mention the internal consultation or use brackets.`,
    },
  ];

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    system: fromConfig.systemPrompt.replace(/\*\*Team collaboration:\*\*[\s\S]*$/i, "").trim(),
    messages: messagesWithConsult,
  });

  return response.content[0]?.type === "text"
    ? response.content[0].text.trim()
    : cleanDraft;
}
