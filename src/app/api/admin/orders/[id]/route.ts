import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { sendEmail, statusUpdateEmail } from "@/lib/email";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      service: true,
      user: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) {
    data.status = body.status;
    // Auto-lock brief when work starts
    if (body.status === "IN_PROGRESS") {
      data.briefLocked = true;
      data.briefLockedAt = new Date();
    }
  }
  if (body.invoiceUrl !== undefined) data.invoiceUrl = body.invoiceUrl;

  const order = await db.order.update({
    where: { id },
    data: data as never,
    include: { user: { select: { name: true, email: true } }, service: { select: { name: true } } },
  });

  // Send email notification on status change
  if (body.status && order.user?.email) {
    const emailData = statusUpdateEmail(
      order.user.name || "Customer",
      order.service?.name || "Your order",
      id,
      body.status
    );
    sendEmail({ to: order.user.email, ...emailData }).catch(() => {});
  }

  return NextResponse.json(order);
}
