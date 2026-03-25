import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

const RATES: Record<string, number> = { USD: 1.0, SEK: 0.092, EUR: 1.08 };
const PLAN_PRICES: Record<string, number> = { creator: 49, streamer: 79, business: 149, growth: 399 };

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  // Run all DB queries + Stripe in parallel
  const [
    activeSubscriptions,
    costEntries,
    aiThisMonth,
    aiBySource,
    aiAllTime,
    ordersThisMonth,
    ordersLastMonth,
    ordersForChart,
    stripeInvoices,
    stripeSubscriptions,
  ] = await Promise.all([
    db.subscription.findMany({ where: { status: "active" }, select: { planSlug: true } }),
    db.costEntry.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
    db.aiUsageLog.aggregate({
      _sum: { costUsd: true, inputTokens: true, outputTokens: true },
      where: { createdAt: { gte: startOfMonth } },
    }),
    db.aiUsageLog.groupBy({
      by: ["source"],
      _sum: { costUsd: true, inputTokens: true, outputTokens: true },
      where: { createdAt: { gte: startOfMonth } },
    }),
    db.aiUsageLog.aggregate({ _sum: { costUsd: true } }),
    db.order.aggregate({
      _sum: { totalPrice: true },
      where: { createdAt: { gte: startOfMonth }, status: { notIn: ["PENDING", "CANCELLED"] } },
    }),
    db.order.aggregate({
      _sum: { totalPrice: true },
      where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth }, status: { notIn: ["PENDING", "CANCELLED"] } },
    }),
    db.order.findMany({
      where: { createdAt: { gte: twelveMonthsAgo }, status: { notIn: ["PENDING", "CANCELLED"] } },
      select: { totalPrice: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    stripe.invoices.list({ status: "paid", limit: 100, created: { gte: Math.floor(twelveMonthsAgo.getTime() / 1000) } }),
    stripe.subscriptions.list({ status: "active", limit: 100, expand: ["data.items.data.price"] }),
  ]);

  // MRR from our DB subscriptions
  const mrr = activeSubscriptions.reduce((sum, s) => sum + (PLAN_PRICES[s.planSlug] ?? 0), 0);

  // Subscribers by plan
  const planCounts: Record<string, number> = {};
  for (const s of activeSubscriptions) {
    planCounts[s.planSlug] = (planCounts[s.planSlug] ?? 0) + 1;
  }
  const subscribersByPlan = Object.entries(PLAN_PRICES).map(([slug, price]) => ({
    slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    count: planCounts[slug] ?? 0,
    monthlyRevenue: (planCounts[slug] ?? 0) * price,
  }));

  // Fixed costs
  const totalFixedCostUsd = costEntries.reduce((sum, c) => sum + c.amountUsd, 0);
  const aiCostThisMonth = aiThisMonth._sum.costUsd ?? 0;
  const totalCostThisMonth = totalFixedCostUsd + aiCostThisMonth;

  // Revenue this month: orders + Stripe invoices
  const orderRevenueThisMonth = ordersThisMonth._sum.totalPrice ?? 0;
  const stripeRevenueThisMonth = stripeInvoices.data
    .filter(inv => inv.created >= Math.floor(startOfMonth.getTime() / 1000))
    .reduce((sum, inv) => sum + inv.amount_paid / 100, 0);
  const totalRevenueThisMonth = orderRevenueThisMonth + stripeRevenueThisMonth;

  // Revenue chart (12 months)
  const months: { label: string; orderRevenue: number; subRevenue: number; total: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const orderRev = ordersForChart
      .filter(o => o.createdAt >= d && o.createdAt < end)
      .reduce((sum, o) => sum + o.totalPrice, 0);
    const subRev = stripeInvoices.data
      .filter(inv => inv.created >= Math.floor(d.getTime() / 1000) && inv.created < Math.floor(end.getTime() / 1000))
      .reduce((sum, inv) => sum + inv.amount_paid / 100, 0);
    months.push({ label, orderRevenue: orderRev, subRevenue: subRev, total: orderRev + subRev });
  }

  return NextResponse.json({
    kpis: {
      mrr,
      totalRevenueThisMonth,
      orderRevenueThisMonth,
      stripeRevenueThisMonth,
      totalCostThisMonth,
      profit: totalRevenueThisMonth - totalCostThisMonth,
      lastMonthOrderRevenue: ordersLastMonth._sum.totalPrice ?? 0,
    },
    subscribers: { byPlan: subscribersByPlan, total: activeSubscriptions.length },
    revenueChart: { months },
    costs: {
      entries: costEntries,
      totalFixedUsd: totalFixedCostUsd,
      aiThisMonth: {
        costUsd: aiCostThisMonth,
        inputTokens: aiThisMonth._sum.inputTokens ?? 0,
        outputTokens: aiThisMonth._sum.outputTokens ?? 0,
      },
      aiBySource,
      aiAllTime: { costUsd: aiAllTime._sum.costUsd ?? 0 },
    },
    breakEven: {
      fixedCostsUsd: totalFixedCostUsd,
      currentMrr: mrr,
      gap: totalFixedCostUsd - mrr,
      coveragePercent: totalFixedCostUsd > 0 ? Math.min(100, Math.round((mrr / totalFixedCostUsd) * 100)) : 100,
    },
    exchangeRates: RATES,
  });
}
