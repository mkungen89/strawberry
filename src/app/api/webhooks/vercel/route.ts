export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateVercelWebhook, logAuditEvent } from "@/lib/landing-page-auth";
import { parseVercelError } from "@/lib/vercel-error-parser";
import { getVercelDeploymentLogs } from "@/lib/vercel";
import { notifyBuildSuccess, notifyBuildFailed } from "@/lib/landing-page-discord";
import { sendPreviewReadyEmail, sendBuildFailedEmail } from "@/lib/landing-page-emails";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-vercel-signature") ?? "";

  if (!validateVercelWebhook(signature, body)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    type: string;
    payload: {
      deployment?: {
        id: string;
        name: string;
        url: string;
        state: string;
        meta?: Record<string, string>;
        buildingAt?: number;
        createdAt?: number;
      };
      projectId?: string;
    };
  };

  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const deployment = payload.payload?.deployment;
  const projectId = payload.payload?.projectId;

  if (!deployment || !projectId) {
    return NextResponse.json({ received: true });
  }

  const state = deployment.state?.toUpperCase();
  const deploymentId = deployment.id;

  // Find the order associated with this Vercel project
  const access = await db.landingPageAccess.findFirst({
    where: { vercelProjectId: projectId },
    include: { order: { include: { user: true } } },
  });

  if (!access) {
    // Not a landing page we manage — ignore
    return NextResponse.json({ received: true });
  }

  const orderId = access.orderId;
  const startedAt = deployment.buildingAt
    ? new Date(deployment.buildingAt)
    : new Date();

  // Map Vercel states to our statuses
  const statusMap: Record<string, string> = {
    BUILDING: "BUILDING",
    READY: "SUCCESS",
    ERROR: "FAILED",
    CANCELED: "CANCELED",
  };
  const status = statusMap[state] ?? "BUILDING";

  // Upsert the build log
  const existingLog = await db.orderBuildLog.findUnique({
    where: { deploymentId },
  });

  const buildNumber = existingLog?.buildNumber ?? (
    await db.orderBuildLog.count({ where: { orderId } }) + 1
  );

  let errorType: string | undefined;
  let errorMessage: string | undefined;
  let suggestedFix: string | undefined;

  if (status === "FAILED") {
    try {
      const logs = await getVercelDeploymentLogs(deploymentId);
      const parsed = parseVercelError(logs);
      errorType = parsed.errorType;
      errorMessage = parsed.message;
      suggestedFix = parsed.suggestedFix;
    } catch {
      errorMessage = "Could not fetch build logs";
    }
  }

  if (existingLog) {
    await db.orderBuildLog.update({
      where: { deploymentId },
      data: {
        status,
        completedAt: status !== "BUILDING" ? new Date() : undefined,
        errorType,
        errorMessage,
        suggestedFix,
      },
    });
  } else {
    await db.orderBuildLog.create({
      data: {
        orderId,
        deploymentId,
        vercelProjectId: projectId,
        status,
        buildNumber,
        errorType,
        errorMessage,
        suggestedFix,
        startedAt,
        completedAt: status !== "BUILDING" ? new Date() : undefined,
      },
    });
  }

  if (status === "SUCCESS") {
    // Update the live URL
    const liveUrl = deployment.url
      ? `https://${deployment.url}`
      : access.vercelUrl;

    await db.landingPageAccess.update({
      where: { orderId },
      data: { vercelUrl: liveUrl },
    });

    const buildTime =
      existingLog?.startedAt
        ? formatDuration(existingLog.startedAt, new Date())
        : "unknown";

    notifyBuildSuccess(orderId, liveUrl, buildTime).catch(() => {});

    await logAuditEvent(orderId, "BUILD_SUCCESS", "system", {
      deploymentId,
      vercelUrl: liveUrl,
    }, { resourceType: "vercel_deploy", resourceId: deploymentId });
  }

  if (status === "FAILED") {
    notifyBuildFailed(orderId, errorMessage ?? "Build failed", suggestedFix ?? "Check Vercel logs").catch(() => {});

    const user = access.order.user;
    if (user?.email) {
      sendBuildFailedEmail(user.email, user.name || "Customer", orderId).catch(() => {});
    }

    await logAuditEvent(orderId, "BUILD_FAILED", "system", {
      deploymentId,
      errorType,
      errorMessage,
      suggestedFix,
    }, {
      resourceType: "vercel_deploy",
      resourceId: deploymentId,
      status: "FAILED",
      errorMessage,
    });
  }

  return NextResponse.json({ received: true });
}

function formatDuration(start: Date, end: Date): string {
  const ms = end.getTime() - start.getTime();
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  if (mins > 0) return `${mins}m ${secs % 60}s`;
  return `${secs}s`;
}
