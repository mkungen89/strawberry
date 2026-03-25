import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getElinResponse } from "@/lib/ai";

// Create a new chat conversation
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`chat-create:${ip}`, { maxRequests: 5, windowSeconds: 600 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const { visitorName, visitorEmail, message } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // Create conversation with initial visitor message
    const conversation = await db.chatConversation.create({
      data: {
        visitorName: visitorName?.trim() || "Visitor",
        visitorEmail: visitorEmail?.trim() || null,
        assignedTo: "Elin Nyström", // Default project coordinator
        messages: {
          create: {
            content: message.trim(),
            senderType: "VISITOR",
            senderName: visitorName?.trim() || "Visitor",
          },
        },
      },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    // Generate AI response from Elin
    const aiResponse = await getElinResponse([
      { role: "user", content: message.trim() },
    ]);

    // Add Elin's response
    const elinMessage = await db.chatMessage.create({
      data: {
        conversationId: conversation.id,
        content: aiResponse,
        senderType: "AGENT",
        senderName: "Elin Nyström",
      },
    });

    // Return conversation with both messages
    const updatedConversation = await db.chatConversation.findUnique({
      where: { id: conversation.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    return NextResponse.json(updatedConversation);
  } catch (err) {
    console.error("[Chat API Error]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
