import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

async function requireAdminOrDev() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "ANALYST") return null; // devs are ADMIN
  return session;
}

/**
 * PATCH /api/admin/tasks/[id]/submit-review
 * Move a task to REVIEW status (developer submits for QA)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "ANALYST"].includes(role ?? "")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { developerNote } = body;

  const task = await db.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  if (task.status === "REVIEW" || task.status === "DONE") {
    return NextResponse.json({ error: "Task already in REVIEW or DONE" }, { status: 400 });
  }

  const now = new Date();

  const updated = await db.task.update({
    where: { id },
    data: {
      status: "REVIEW",
      qaStatus: "PENDING",
      submittedForReviewAt: now,
      updatedAt: now,
    },
    include: {
      project: { select: { id: true, title: true, category: true, color: true } },
      assignee: { select: { id: true, name: true, role: true, avatar: true } },
      updates: { orderBy: { createdAt: "asc" } },
    },
  });

  // Auto-create status-change comment
  await db.taskUpdate.create({
    data: {
      taskId: id,
      authorName: session.user.name || "Developer",
      content: developerNote
        ? `🔍 Submitted for QA review.\n\n${developerNote}`
        : "🔍 Submitted for QA review — ready for Code Analyst.",
      updateType: "QA_SUBMITTED",
      bugsFound: [],
    },
  });

  return NextResponse.json(updated);
}
