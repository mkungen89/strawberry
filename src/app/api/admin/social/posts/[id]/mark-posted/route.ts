import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const post = await db.socialPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (post.status === "PUBLISHED") return NextResponse.json({ error: "Already published." }, { status: 409 });

  const updated = await db.socialPost.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date(), errorMsg: null },
    include: { author: true, replies: { include: { author: true } } },
  });

  return NextResponse.json(updated);
}
