import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

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
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

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
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...data } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const ALLOWED_FIELDS = new Set([
    "title", "description", "status", "priority", "progress",
    "dueDate", "projectId", "assigneeId", "assigneeName", "category",
  ]);
  const safeData = Object.fromEntries(
    Object.entries(data).filter(([key]) => ALLOWED_FIELDS.has(key))
  );

  const task = await db.task.update({
    where: { id },
    data: {
      ...safeData,
      dueDate: safeData.dueDate ? new Date(safeData.dueDate as string) : undefined,
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
