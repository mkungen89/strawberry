"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  CheckCircle,
  BarChart3,
  ShieldCheck,
  Users,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface AnalyticsData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
  orders: {
    total: number;
    byStatus: { status: string; count: number }[];
    completedThisMonth: number;
  };
  tasks: {
    total: number;
    byStatus: { status: string; count: number }[];
    overdue: number;
  };
  qa: {
    totalReviewed: number;
    approved: number;
    rejected: number;
    approvalRate: number;
  };
  team: {
    totalMembers: number;
    activeTasksPerMember: number;
  };
}

const ORDER_STATUS_META: Record<
  string,
  { label: string; color: string; barColor: string }
> = {
  PENDING:     { label: "Pending",     color: "text-yellow-400",  barColor: "bg-yellow-500" },
  PAID:        { label: "Paid / Queue",color: "text-blue-400",    barColor: "bg-blue-500" },
  IN_PROGRESS: { label: "In Progress", color: "text-purple-400",  barColor: "bg-purple-500" },
  REVIEW:      { label: "Review",      color: "text-orange-400",  barColor: "bg-orange-500" },
  REVISION:    { label: "Revision",    color: "text-pink-400",    barColor: "bg-pink-500" },
  COMPLETED:   { label: "Completed",   color: "text-green-400",   barColor: "bg-green-500" },
  CANCELLED:   { label: "Cancelled",   color: "text-red-400",     barColor: "bg-red-500" },
};

const STATUS_ORDER = ["PENDING", "PAID", "IN_PROGRESS", "REVIEW", "REVISION", "COMPLETED", "CANCELLED"];

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function pctChange(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((current - prev) / prev) * 100);
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
    if (!isPending && session && (session.user as { role?: string }).role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
      setLastRefreshed(new Date());
    } catch {
      // silently keep stale data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session && (session.user as { role?: string }).role === "ADMIN") {
      fetchData();
      const interval = setInterval(fetchData, 60_000);
      return () => clearInterval(interval);
    }
  }, [session, fetchData]);

  if (isPending || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-gray-400">Failed to load analytics.</p>
      </div>
    );
  }

  const revenueChange = pctChange(data.revenue.thisMonth, data.revenue.lastMonth);
  const activeOrders =
    (data.orders.byStatus.find((s) => s.status === "IN_PROGRESS")?.count ?? 0) +
    (data.orders.byStatus.find((s) => s.status === "REVIEW")?.count ?? 0);
  const completedOrders =
    data.orders.byStatus.find((s) => s.status === "COMPLETED")?.count ?? 0;

  const maxOrderCount = Math.max(...data.orders.byStatus.map((s) => s.count), 1);

  const taskByStatus = (status: string) =>
    data.tasks.byStatus.find((s) => s.status === status)?.count ?? 0;

  return (
    <div className="min-h-screen text-white">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">Analytics</h1>
            </div>
            <p className="text-gray-400">Business performance and operational metrics.</p>
          </div>
          <div className="flex items-center gap-3">
            {lastRefreshed && (
              <span className="text-xs text-gray-600">
                Updated {lastRefreshed.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue */}
          <Card className="border-white/[0.06] bg-gradient-to-br from-purple-600/15 to-pink-600/10 text-white">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                </div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">All time</span>
              </div>
              <p className="text-2xl font-bold">{fmt(data.revenue.total)}</p>
              <p className="mt-1 text-sm text-gray-400">Total Revenue</p>
            </CardContent>
          </Card>

          {/* This Month Revenue */}
          <Card className="border-white/[0.06] bg-white/[0.03] text-white">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05]">
                  {revenueChange !== null && revenueChange >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  )}
                </div>
                {revenueChange !== null && (
                  <span
                    className={`text-xs font-semibold ${
                      revenueChange >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {revenueChange >= 0 ? "+" : ""}
                    {revenueChange}% vs last month
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold">{fmt(data.revenue.thisMonth)}</p>
              <p className="mt-1 text-sm text-gray-400">This Month Revenue</p>
              <p className="mt-0.5 text-xs text-gray-600">
                Last month: {fmt(data.revenue.lastMonth)}
              </p>
            </CardContent>
          </Card>

          {/* Active Orders */}
          <Card className="border-white/[0.06] bg-white/[0.03] text-white">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
                  <Package className="h-5 w-5 text-purple-400" />
                </div>
              </div>
              <p className="text-2xl font-bold">{activeOrders}</p>
              <p className="mt-1 text-sm text-gray-400">Active Orders</p>
              <p className="mt-0.5 text-xs text-gray-600">IN_PROGRESS + REVIEW</p>
            </CardContent>
          </Card>

          {/* Completed Orders */}
          <Card className="border-white/[0.06] bg-white/[0.03] text-white">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-bold">{completedOrders}</p>
              <p className="mt-1 text-sm text-gray-400">Completed Orders</p>
              <p className="mt-0.5 text-xs text-gray-600">
                {data.orders.completedThisMonth} this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Middle Row ─────────────────────────────────────────────────────── */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Orders by Status bar chart */}
          <Card className="border-white/[0.06] bg-white/[0.03] text-white">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-400" />
                <h2 className="font-semibold">Orders by Status</h2>
                <span className="ml-auto text-xs text-gray-600">{data.orders.total} total</span>
              </div>
              <div className="space-y-3">
                {STATUS_ORDER.map((status) => {
                  const row = data.orders.byStatus.find((s) => s.status === status);
                  const count = row?.count ?? 0;
                  const meta = ORDER_STATUS_META[status] ?? {
                    label: status,
                    color: "text-gray-400",
                    barColor: "bg-gray-500",
                  };
                  const widthPct = Math.round((count / maxOrderCount) * 100);
                  return (
                    <div key={status}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className={`font-medium ${meta.color}`}>{meta.label}</span>
                        <span className="text-gray-500">{count}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${meta.barColor}`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* QA Performance */}
          <Card className="border-white/[0.06] bg-white/[0.03] text-white">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-purple-400" />
                <h2 className="font-semibold">QA Performance</h2>
              </div>

              {data.qa.totalReviewed === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShieldCheck className="mb-3 h-10 w-10 text-gray-700" />
                  <p className="text-sm text-gray-500">No tasks reviewed yet.</p>
                </div>
              ) : (
                <>
                  {/* Big approval rate */}
                  <div className="mb-6 flex items-end gap-3">
                    <span
                      className={`text-5xl font-bold tabular-nums ${
                        data.qa.approvalRate >= 80
                          ? "text-green-400"
                          : data.qa.approvalRate >= 50
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {data.qa.approvalRate}%
                    </span>
                    <div className="mb-1">
                      <p className="text-sm font-medium text-gray-300">Approval Rate</p>
                      <p className="text-xs text-gray-600">{data.qa.totalReviewed} tasks reviewed</p>
                    </div>
                  </div>

                  {/* Approved vs Rejected bar */}
                  <div className="mb-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                      <span>Approved</span>
                      <span>Rejected</span>
                    </div>
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-red-500/40">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all duration-500"
                        style={{
                          width: `${data.qa.approvalRate}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3">
                      <p className="text-xs text-green-400">Approved</p>
                      <p className="text-xl font-bold text-green-300">{data.qa.approved}</p>
                    </div>
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                      <p className="text-xs text-red-400">Rejected</p>
                      <p className="text-xl font-bold text-red-300">{data.qa.rejected}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Bottom Row ─────────────────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Task Overview */}
          <Card className="border-white/[0.06] bg-white/[0.03] text-white">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-400" />
                <h2 className="font-semibold">Task Overview</h2>
                <span className="ml-auto text-xs text-gray-600">{data.tasks.total} total</span>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Total Tasks",
                    value: data.tasks.total,
                    colorClass: "text-white",
                    bgClass: "bg-white/[0.05]",
                  },
                  {
                    label: "In Progress",
                    value: taskByStatus("IN_PROGRESS"),
                    colorClass: "text-purple-300",
                    bgClass: "bg-purple-500/10",
                  },
                  {
                    label: "In Review",
                    value: taskByStatus("REVIEW"),
                    colorClass: "text-orange-300",
                    bgClass: "bg-orange-500/10",
                  },
                  {
                    label: "Done",
                    value: taskByStatus("DONE"),
                    colorClass: "text-green-300",
                    bgClass: "bg-green-500/10",
                  },
                ].map(({ label, value, colorClass, bgClass }) => (
                  <div
                    key={label}
                    className={`rounded-xl border border-white/[0.06] p-4 ${bgClass}`}
                  >
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
                  </div>
                ))}
              </div>
              {data.tasks.overdue > 0 && (
                <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                  <p className="text-sm text-red-300">
                    <span className="font-semibold">{data.tasks.overdue}</span> overdue task
                    {data.tasks.overdue > 1 ? "s" : ""} need attention
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team */}
          <Card className="border-white/[0.06] bg-white/[0.03] text-white">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" />
                <h2 className="font-semibold">Team</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-5">
                  <p className="text-xs text-gray-500 mb-1">Active Members</p>
                  <p className="text-3xl font-bold text-white">{data.team.totalMembers}</p>
                </div>
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-5">
                  <p className="text-xs text-gray-500 mb-1">Active Tasks / Member</p>
                  <p className="text-3xl font-bold text-purple-300">
                    {data.team.activeTasksPerMember}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-600">
                Average number of IN_PROGRESS or REVIEW tasks per active team member.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
