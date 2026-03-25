import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { postTweet } from "@/lib/social/x";
import { createPin } from "@/lib/social/pinterest";

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
  const post = await db.socialPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (post.status === "PUBLISHED") return NextResponse.json({ error: "Already published." }, { status: 409 });

  try {
    let externalId: string;
    let externalUrl: string;

    if (post.platform === "X") {
      const result = await postTweet(post.content);
      externalId = result.id;
      externalUrl = result.url;
    } else if (post.platform === "PINTEREST") {
      if (!post.boardId) throw new Error("Board ID is required for Pinterest posts.");
      const result = await createPin({
        boardId: post.boardId,
        title: post.title ?? post.content.slice(0, 100),
        description: post.content,
        link: post.link ?? undefined,
        imageUrl: post.imageUrl ?? undefined,
      });
      externalId = result.id;
      externalUrl = result.url;
    } else {
      throw new Error(`Unsupported platform: ${post.platform}`);
    }

    const updated = await db.socialPost.update({
      where: { id },
      data: { status: "PUBLISHED", externalId, externalUrl, publishedAt: new Date(), errorMsg: null },
      include: { author: true, replies: { include: { author: true } } },
    });

    return NextResponse.json(updated);
  } catch (err) {
    await db.socialPost.update({
      where: { id },
      data: { status: "FAILED", errorMsg: (err as Error).message },
    });
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
