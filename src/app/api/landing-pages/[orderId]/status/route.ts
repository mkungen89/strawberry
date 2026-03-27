import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { validateAccessToken } from "@/lib/landing-page-auth";
import { getGitHubFileChanges } from "@/lib/github";
import { getVercelDeploymentLogs } from "@/lib/vercel";

/**
 * Real-time status endpoint for landing page orders
 * Returns: repo status, Vercel deployment status, coding progress, recent commits
 * Used by frontend dashboard for polling updates
 */
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

  // Fetch landing page access record
  const access = await db.landingPageAccess.findUnique({ where: { orderId } });
  if (!access) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get most recent build logs
  const latestBuild = await db.orderBuildLog.findFirst({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });

  // Get recent audit events to show progress
  const auditLogs = await db.auditLog.findMany({
    where: { orderId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Extract agent-related logs
  const agentLogs = auditLogs.filter((l) =>
    ["AGENT_SPAWNED", "AGENT_PROGRESS", "AGENT_SPAWN_FAILED"].includes(l.action)
  );

  const agentStatus = getAgentProgressStatus(agentLogs);

  // Get recent commits from GitHub
  let recentCommits: any[] = [];
  try {
    const repoName = access.githubRepo.split("/").pop() || "";
    const commits = await getGitHubFileChanges(repoName, new Date(Date.now() - 24 * 60 * 60 * 1000));
    recentCommits = commits.slice(0, 5);
  } catch (e) {
    console.warn("[Status] Could not fetch commits:", e);
  }

  // Build status timeline
  const timeline = auditLogs.map((l) => ({
    timestamp: l.createdAt.toISOString(),
    action: l.action,
    actor: l.actor,
    status: l.status,
    details: l.details,
  }));

  // Vercel deployment status
  const vercelStatus = latestBuild
    ? {
        status: latestBuild.status,
        buildNumber: latestBuild.buildNumber,
        startedAt: latestBuild.startedAt.toISOString(),
        completedAt: latestBuild.completedAt?.toISOString() || null,
        errorType: latestBuild.errorType,
        errorMessage: latestBuild.errorMessage,
        suggestedFix: latestBuild.suggestedFix,
      }
    : null;

  return NextResponse.json({
    orderId,
    previewUrl: access.vercelUrl,
    customDomain: access.customDomain,
    githubRepo: access.githubRepo,
    canEdit: access.canEdit,
    canDeploy: access.canDeploy,

    // Coding agent status
    agent: {
      status: agentStatus.status,
      lastUpdate: agentStatus.lastUpdate,
      message: agentStatus.message,
      commitsCreated: agentStatus.commitsCount,
    },

    // Vercel deployment status
    deployment: vercelStatus,

    // Recent commits
    recentCommits: recentCommits.map((c) => ({
      sha: c.sha,
      message: c.message,
      author: c.author,
      timestamp: c.timestamp,
      filesChanged: c.filesChanged?.length ?? 0,
    })),

    // Full timeline of events
    timeline,

    // Health check
    health: {
      repoExists: true,
      vercelLinked: !!latestBuild,
      agentRunning: agentStatus.status === "RUNNING",
      lastActivity: timeline[0]?.timestamp || new Date().toISOString(),
    },
  });
}

/**
 * Extract agent progress status from audit logs
 */
function getAgentProgressStatus(
  logs: Array<{ action: string; details: any; createdAt: Date }>
) {
  if (logs.length === 0) {
    return {
      status: "IDLE",
      lastUpdate: new Date().toISOString(),
      message: "No coding agent activity yet",
      commitsCount: 0,
    };
  }

  const latestLog = logs[0];

  // Determine current status
  let status = "IDLE";
  let message = "No activity";

  if (latestLog.action === "AGENT_SPAWN_FAILED") {
    status = "FAILED";
    message = latestLog.details?.error || "Agent spawn failed";
  } else if (latestLog.action === "AGENT_SPAWNED") {
    status = "RUNNING";
    message = "Coding agent is building your landing page...";
  } else if (latestLog.action === "AGENT_PROGRESS") {
    const progressDetails = latestLog.details;
    if (progressDetails?.status === "COMPLETED") {
      status = "COMPLETED";
      message = "Landing page built successfully";
    } else if (progressDetails?.status === "FAILED") {
      status = "FAILED";
      message = progressDetails?.message || "Agent encountered an error";
    } else {
      status = "RUNNING";
      message = progressDetails?.message || "Building landing page...";
    }
  }

  // Count commits from progress logs
  let commitsCount = 0;
  for (const log of logs) {
    if (log.action === "AGENT_PROGRESS" && log.details?.commits) {
      commitsCount = Math.max(commitsCount, log.details.commits.length);
    }
  }

  return {
    status,
    lastUpdate: latestLog.createdAt.toISOString(),
    message,
    commitsCount,
  };
}
