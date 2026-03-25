import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // ── Revenue ──────────────────────────────────────────────────────────────
  const [revenueTotal, revenueThisMonth, revenueLastMonth] = await Promise.all([
    db.order.aggregate({ _sum: { totalPrice: true } }),
    db.order.aggregate({
      _sum: { totalPrice: true },
      where: { createdAt: { gte: startOfThisMonth } },
    }),
    db.order.aggregate({
      _sum: { totalPrice: true },
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
  ]);

  // ── Orders ────────────────────────────────────────────────────────────────
  const [orderCount, ordersByStatus, completedThisMonth] = await Promise.all([
    db.order.count(),
    db.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    db.order.count({
      where: {
        status: "COMPLETED",
        createdAt: { gte: startOfThisMonth },
      },
    }),
  ]);

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const [taskCount, tasksByStatus, overdueCount] = await Promise.all([
    db.task.count(),
    db.task.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    db.task.count({
      where: {
        status: { not: "DONE" },
        dueDate: { lt: now },
      },
    }),
  ]);

  // ── QA ────────────────────────────────────────────────────────────────────
  const [approvedCount, rejectedCount] = await Promise.all([
    db.task.count({ where: { qaStatus: "APPROVED" } }),
    db.task.count({ where: { qaStatus: "REJECTED" } }),
  ]);
  const totalReviewed = approvedCount + rejectedCount;
  const approvalRate = totalReviewed > 0 ? Math.round((approvedCount / totalReviewed) * 100) : 0;

  // ── Team ──────────────────────────────────────────────────────────────────
  const [totalMembers, activeTasksCount] = await Promise.all([
    db.teamMember.count({ where: { status: "ACTIVE" } }),
    db.task.count({ where: { status: { in: ["IN_PROGRESS", "REVIEW"] } } }),
  ]);
  const activeTasksPerMember =
    totalMembers > 0 ? Math.round((activeTasksCount / totalMembers) * 10) / 10 : 0;

  return NextResponse.json({
    revenue: {
      total: revenueTotal._sum.totalPrice ?? 0,
      thisMonth: revenueThisMonth._sum.totalPrice ?? 0,
      lastMonth: revenueLastMonth._sum.totalPrice ?? 0,
    },
    orders: {
      total: orderCount,
      byStatus: ordersByStatus.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      completedThisMonth,
    },
    tasks: {
      total: taskCount,
      byStatus: tasksByStatus.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      overdue: overdueCount,
    },
    qa: {
      totalReviewed,
      approved: approvedCount,
      rejected: rejectedCount,
      approvalRate,
    },
    team: {
      totalMembers,
      activeTasksPerMember,
    },
  });
}
