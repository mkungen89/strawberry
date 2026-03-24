import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

async function getAuthorizedUser(customerId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";
  const isSelf = session.user.id === customerId;
  if (!isAdmin && !isSelf) return null;
  return session;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;
  if (!await getAuthorizedUser(customerId)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform") ?? undefined;
  const days = parseInt(searchParams.get("days") ?? "30");

  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const metrics = await db.cMMetrics.findMany({
      where: {
        customerId,
        ...(platform ? { platform } : {}),
        recordedAt: { gte: since },
      },
      orderBy: { recordedAt: "asc" },
    }).catch(() => []);

    // Aggregate summary stats
    const latest = metrics.length > 0 ? metrics[metrics.length - 1] : null;
    const oldest = metrics.length > 0 ? metrics[0] : null;

    const summary = {
      totalPosts: metrics.reduce((s, m) => s + (m.postsCount ?? 0), 0),
      avgEngagementRate: metrics.length > 0
        ? metrics.reduce((s, m) => s + (m.engagementRate ?? 0), 0) / metrics.length
        : 0,
      followerGrowth: latest && oldest
        ? (latest.followers ?? 0) - (oldest.followers ?? 0)
        : 0,
      totalReach: metrics.reduce((s, m) => s + (m.reach ?? 0), 0),
      totalImpressions: metrics.reduce((s, m) => s + (m.impressions ?? 0), 0),
    };

    return NextResponse.json({ metrics, summary, period: { days, since } });
  } catch (err) {
    console.error("[CM Metrics]", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
