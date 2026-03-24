import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

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
