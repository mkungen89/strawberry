import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
