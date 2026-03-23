import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const assigneeId = searchParams.get("assigneeId");
  const projectId = searchParams.get("projectId");

  const tasks = await db.task.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(assigneeId ? { assigneeId } : {}),
      ...(projectId ? { projectId } : {}),
    },
    include: {
      project: { select: { id: true, title: true, category: true, color: true } },
      assignee: { select: { id: true, name: true, role: true, avatar: true } },
      updates: { orderBy: { createdAt: "desc" }, take: 3 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { title, description, status, priority, progress, dueDate, projectId, assigneeId, assigneeName } = body;

  const task = await db.task.create({
    data: {
      title,
      description,
      status: status || "BACKLOG",
      priority: priority || "NORMAL",
      progress: progress ?? 0,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      projectId: projectId || undefined,
      assigneeId: assigneeId || undefined,
      assigneeName: assigneeName || undefined,
    },
    include: {
      project: { select: { id: true, title: true, category: true, color: true } },
      assignee: { select: { id: true, name: true, role: true, avatar: true } },
      updates: true,
    },
  });

  return NextResponse.json(task, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id, ...data } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const task = await db.task.update({
    where: { id },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      updatedAt: new Date(),
    },
    include: {
      project: { select: { id: true, title: true, category: true, color: true } },
      assignee: { select: { id: true, name: true, role: true, avatar: true } },
      updates: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });

  return NextResponse.json(task);
}
