import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

/**
 * PATCH /api/admin/tasks/[id]/reject
 * Code Analyst rejects the task → return to IN_PROGRESS with bugs list
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
  const { bugsFound, notes } = body as { bugsFound?: string[]; notes?: string };

  if (!bugsFound || !Array.isArray(bugsFound) || bugsFound.length === 0) {
    return NextResponse.json({ error: "bugsFound array is required with at least 1 bug" }, { status: 400 });
  }

  const task = await db.task.findUnique({
    where: { id },
    include: { assignee: true },
  });
  if (!task) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  if (task.status !== "REVIEW") {
    return NextResponse.json({ error: "Task must be in REVIEW status to reject" }, { status: 400 });
  }

  const now = new Date();

  const updated = await db.task.update({
    where: { id },
    data: {
      status: "IN_PROGRESS",
      qaStatus: "REJECTED",
      rejectedAt: now,
      reviewedBy: session.user.name || "Code Analyst",
      priority: "HIGH", // Auto-escalate priority
      updatedAt: now,
    },
    include: {
      project: { select: { id: true, title: true, category: true, color: true } },
      assignee: { select: { id: true, name: true, role: true, avatar: true } },
      updates: { orderBy: { createdAt: "asc" } },
    },
  });

  // Build bug report comment
  const bugList = bugsFound.map((bug, i) => `${i + 1}. ${bug}`).join("\n");
  const commentContent = [
    `🐛 QA Review by ${session.user.name} — REJECTED`,
    ``,
    `**Bugs found (${bugsFound.length}):**`,
    bugList,
    notes ? `\n**Notes:** ${notes}` : "",
    ``,
    `Task returned to IN_PROGRESS and assigned back to original developer.`,
  ].filter(Boolean).join("\n");

  await db.taskUpdate.create({
    data: {
      taskId: id,
      authorName: session.user.name || "Code Analyst",
      content: commentContent,
      updateType: "QA_REJECTED",
      bugsFound,
    },
  });

  // Auto-email developer notification
  // TODO: Integrate with sendEmail when developer email is available
  // const developerEmail = task.assignee?.email;
  // if (developerEmail) {
  //   await sendEmail({
  //     to: developerEmail,
  //     subject: `🐛 Task "${task.title}" returned — bugs found`,
  //     html: emailBody,
  //   });
  // }

  return NextResponse.json({
    task: updated,
    bugsFound,
    notifiedDeveloper: false, // Update when email is wired
  });
}
