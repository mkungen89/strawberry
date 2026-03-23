import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { taskId, content, authorName } = await req.json();
  if (!taskId || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const update = await db.taskUpdate.create({
    data: {
      taskId,
      content,
      authorName: authorName || "Admin",
    },
  });

  // Also update task updatedAt
  await db.task.update({ where: { id: taskId }, data: { updatedAt: new Date() } });

  return NextResponse.json(update, { status: 201 });
}
