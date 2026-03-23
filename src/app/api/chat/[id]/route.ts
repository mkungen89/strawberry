import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

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

  const conversation = await db.chatConversation.findUnique({ where: { id } });
  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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

  return NextResponse.json(message);
}
