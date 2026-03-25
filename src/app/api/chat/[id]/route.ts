import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getElinResponse, type ChatMessage } from "@/lib/ai";

// Get conversation messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const conversation = await db.chatConversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(conversation);
}

// Send a message to an existing conversation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`chat-msg:${ip}`, { maxRequests: 30, windowSeconds: 60 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many messages. Please slow down." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
    );
  }

  const { id } = await params;
  const { content, senderType, senderName } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }

  const conversation = await db.chatConversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (conversation.status === "CLOSED") {
    return NextResponse.json({ error: "Conversation is closed." }, { status: 409 });
  }

  // Create visitor message
  const message = await db.chatMessage.create({
    data: {
      conversationId: id,
      content: content.trim(),
      senderType: senderType || "VISITOR",
      senderName: senderName || "Visitor",
    },
  });

  // Update conversation timestamp
  await db.chatConversation.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  // Build conversation history for AI
  const history: ChatMessage[] = conversation.messages.map((msg) => ({
    role: msg.senderType === "VISITOR" ? "user" : "assistant",
    content: msg.content,
  }));

  // Add the new visitor message
  history.push({ role: "user", content: content.trim() });

  // Generate AI response from Elin
  const aiResponse = await getElinResponse(history);

  // Create Elin's response message
  const elinMessage = await db.chatMessage.create({
    data: {
      conversationId: id,
      content: aiResponse,
      senderType: "AGENT",
      senderName: "Elin Nyström",
    },
  });

  // Return both messages (visitor + Elin)
  return NextResponse.json({
    visitorMessage: message,
    elinMessage,
  });
}

// Close a conversation
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const conversation = await db.chatConversation.findUnique({ where: { id } });
  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.chatConversation.update({
    where: { id },
    data: { status: "CLOSED", closedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
