import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

/**
 * PATCH /api/admin/tasks/[id]/approve
 * Code Analyst approves the task → move to DONE
 * Requires ANALYST or ADMIN role
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "ANALYST"].includes(role ?? "")) {
    return NextResponse.json({ error: "FORBIDDEN — requires ANALYST role" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { approverNote } = body;

  const task = await db.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  if (task.status !== "REVIEW") {
    return NextResponse.json({ error: "Task must be in REVIEW status to approve" }, { status: 400 });
  }

  const now = new Date();

  const updated = await db.task.update({
    where: { id },
    data: {
      status: "DONE",
      qaStatus: "APPROVED",
      approvedAt: now,
      reviewedBy: session.user.name || "Code Analyst",
      progress: 100,
      updatedAt: now,
    },
    include: {
      project: { select: { id: true, title: true, category: true, color: true } },
      assignee: { select: { id: true, name: true, role: true, avatar: true } },
      updates: { orderBy: { createdAt: "asc" } },
    },
  });

  // Auto-create approval comment
  await db.taskUpdate.create({
    data: {
      taskId: id,
      authorName: session.user.name || "Code Analyst",
      content: approverNote
        ? `✅ QA Approved by ${session.user.name}.\n\n${approverNote}`
        : `✅ QA Approved by ${session.user.name} — task moved to Done.`,
      updateType: "QA_APPROVED",
      bugsFound: [],
    },
  });

  // TODO: Notify customer if applicable (send email via sendEmail)
  // if (task.orderId) { await sendCustomerNotification(task.orderId); }

  return NextResponse.json(updated);
}
