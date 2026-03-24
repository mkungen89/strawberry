import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const { content, authorName } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  const update = await db.taskUpdate.create({
    data: {
      taskId: id,
      content: content.trim(),
      authorName: authorName || "Admin",
    },
  });

  // Also bump task updatedAt
  await db.task.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json(update, { status: 201 });
}
