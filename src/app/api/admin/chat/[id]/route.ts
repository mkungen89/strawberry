import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// Get conversation with all messages (admin)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;

  const conversation = await db.chatConversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(conversation);
}

// Admin sends a reply
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const { content } = await req.json();

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
      senderType: "AGENT",
      senderName: conversation.assignedTo || "Vexcraft Support",
    },
  });

  await db.chatConversation.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(message);
}

// Close/update conversation
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const { status, assignedTo } = await req.json();

  const data: Record<string, unknown> = {};
  if (status) {
    data.status = status;
    if (status === "CLOSED") data.closedAt = new Date();
  }
  if (assignedTo) data.assignedTo = assignedTo;

  const conversation = await db.chatConversation.update({
    where: { id },
    data,
  });

  return NextResponse.json(conversation);
}
