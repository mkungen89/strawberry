import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { postId, content, authorId } = await req.json();
  if (!postId || !content?.trim() || !authorId) {
    return NextResponse.json({ error: "postId, content and authorId are required." }, { status: 400 });
  }

  const [post, author] = await Promise.all([
    db.socialPost.findUnique({ where: { id: postId } }),
    db.teamMember.findUnique({ where: { id: authorId } }),
  ]);

  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (!author) return NextResponse.json({ error: "Author not found." }, { status: 404 });
  if (post.status !== "PUBLISHED") return NextResponse.json({ error: "Can only reply to published posts." }, { status: 400 });

  const reply = await db.socialReply.create({
    data: { postId, content: content.trim(), authorId, authorName: author.name, status: "DRAFT" },
    include: { author: true },
  });

  return NextResponse.json(reply, { status: 201 });
}
