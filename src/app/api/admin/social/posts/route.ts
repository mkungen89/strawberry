import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const posts = await db.socialPost.findMany({
    include: { author: true, replies: { include: { author: true }, orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { platform, content, title, link, boardId, boardName, imageUrl, subreddit, authorId } = body;

  if (!platform || !content?.trim() || !authorId) {
    return NextResponse.json({ error: "platform, content and authorId are required." }, { status: 400 });
  }

  const author = await db.teamMember.findUnique({ where: { id: authorId } });
  if (!author) return NextResponse.json({ error: "Author not found." }, { status: 404 });

  const post = await db.socialPost.create({
    data: {
      platform,
      content: content.trim(),
      title: title?.trim() || null,
      link: link?.trim() || null,
      boardId: boardId || null,
      boardName: boardName || null,
      imageUrl: imageUrl?.trim() || null,
      subreddit: subreddit?.trim() || null,
      authorId,
      authorName: author.name,
      status: "DRAFT",
    },
    include: { author: true, replies: true },
  });

  return NextResponse.json(post, { status: 201 });
}
