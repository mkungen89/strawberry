import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { triggerRedeploy } from "@/lib/vercel";
import { logAuditEvent } from "@/lib/landing-page-auth";
import { notifyDeployApproved } from "@/lib/landing-page-discord";
import { sendDeliveryReadyEmail } from "@/lib/landing-page-emails";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json();
  const { approved, notes } = body as { approved: boolean; notes?: string };

  const access = await db.landingPageAccess.findUnique({
    where: { orderId },
    include: { order: { include: { user: true } } },
  });

  if (!access) {
    return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
  }

  if (!approved) {
    await logAuditEvent(orderId, "DEPLOYMENT_REJECTED", `admin:${session.user.email}`, {
      notes,
    }, { resourceType: "vercel_deploy", status: "SUCCESS" });
    return NextResponse.json({ success: true, action: "rejected" });
  }

  try {
    const { deploymentId } = await triggerRedeploy(access.vercelProjectId);

    await logAuditEvent(
      orderId,
      "DEPLOYMENT_APPROVED",
      `admin:${session.user.email}`,
      { deploymentId, notes },
      {
        resourceType: "vercel_deploy",
        resourceId: deploymentId,
        actorEmail: session.user.email,
        req,
      }
    );

    notifyDeployApproved(orderId, session.user.name || session.user.email).catch(() => {});

    const user = access.order.user;
    if (user?.email) {
      sendDeliveryReadyEmail(
        user.email,
        user.name || "Customer",
        orderId,
        access.vercelUrl,
        access.accessToken
      ).catch(() => {});
    }

    return NextResponse.json({ success: true, deploymentId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await logAuditEvent(orderId, "DEPLOYMENT_APPROVED", `admin:${session.user.email}`, {
      error: message,
    }, { status: "FAILED", errorMessage: message });
    return NextResponse.json({ error: "Redeploy failed", details: message }, { status: 500 });
  }
}
