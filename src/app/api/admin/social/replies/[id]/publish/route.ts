import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { replyToTweet } from "@/lib/social/x";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const reply = await db.socialReply.findUnique({ where: { id }, include: { post: true } });
  if (!reply) return NextResponse.json({ error: "Reply not found." }, { status: 404 });
  if (reply.status === "PUBLISHED") return NextResponse.json({ error: "Already published." }, { status: 409 });
  if (!reply.post.externalId) return NextResponse.json({ error: "Parent post has no external ID." }, { status: 400 });

  try {
    let externalId: string;

    if (reply.post.platform === "X") {
      const result = await replyToTweet(reply.content, reply.post.externalId);
      externalId = result.id;
    } else {
      // Pinterest doesn't support API replies — mark as published with note
      externalId = `manual-${Date.now()}`;
    }

    const updated = await db.socialReply.update({
      where: { id },
      data: { status: "PUBLISHED", externalId, publishedAt: new Date(), errorMsg: null },
      include: { author: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    await db.socialReply.update({
      where: { id },
      data: { status: "FAILED", errorMsg: (err as Error).message },
    });
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
