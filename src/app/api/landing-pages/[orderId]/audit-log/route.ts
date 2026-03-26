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

  const logs = await db.auditLog.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json(
    logs.map((l) => ({
      id: l.id,
      action: l.action,
      actor: l.actor,
      timestamp: l.createdAt.toISOString(),
      resourceType: l.resourceType,
      resourceId: l.resourceId,
      status: l.status,
      details: l.details,
      // IP + user agent only visible to admin
      ...(isAdmin ? { ipAddress: l.ipAddress, errorMessage: l.errorMessage } : {}),
    }))
  );
}
