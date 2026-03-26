import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { validateAccessToken } from "@/lib/landing-page-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  // Auth: admin session OR customer bearer token
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user?.role === "ADMIN";

  const tokenParam = req.nextUrl.searchParams.get("token");

  if (!isAdmin) {
    if (!tokenParam) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    const { valid } = await validateAccessToken(orderId, tokenParam);
    if (!valid) {
      return NextResponse.json({ error: "Invalid access token" }, { status: 403 });
    }
  }

  const access = await db.landingPageAccess.findUnique({ where: { orderId } });
  if (!access) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const builds = await db.orderBuildLog.findMany({
    where: { orderId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const auditLogs = await db.auditLog.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  const latestBuild = builds[0];
  const buildStatus = latestBuild
    ? {
        status: latestBuild.status,
        lastBuild: latestBuild.completedAt?.toISOString() ?? latestBuild.startedAt.toISOString(),
        buildTime:
          latestBuild.completedAt
            ? formatDuration(latestBuild.startedAt, latestBuild.completedAt)
            : "In progress",
      }
    : null;

  return NextResponse.json({
    orderId,
    status: latestBuild?.status ?? "PENDING",
    previewUrl: access.vercelUrl,
    customDomain: access.customDomain,
    githubRepo: access.githubRepo,
    canEdit: access.canEdit,
    canDeploy: access.canDeploy,
    buildStatus,
    timeline: auditLogs.map((l) => ({
      action: l.action,
      actor: l.actor,
      timestamp: l.createdAt.toISOString(),
      resourceType: l.resourceType,
      resourceId: l.resourceId,
      status: l.status,
      details: l.details,
    })),
  });
}

function formatDuration(start: Date, end: Date): string {
  const ms = end.getTime() - start.getTime();
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  if (mins > 0) return `${mins}m ${secs % 60}s`;
  return `${secs}s`;
}
