import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { sendEmail } from "@/lib/email";
import { reviewReminderEmail } from "@/lib/email-templates";

/**
 * POST /api/admin/orders/[id]/send-review-reminder
 * Send a review reminder email to the customer
 */
export async function POST(
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
      user: { select: { name: true, email: true } },
      service: { select: { name: true } },
      review: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.review) {
    return NextResponse.json({ error: "Review already submitted" }, { status: 400 });
  }

  if (order.status !== "COMPLETED") {
    return NextResponse.json({ error: "Order not completed yet" }, { status: 400 });
  }

  if (!order.user?.email) {
    return NextResponse.json({ error: "No email for customer" }, { status: 400 });
  }

  // Send review reminder
  const emailData = reviewReminderEmail(
    order.user.name || "Customer",
    order.service?.name || "Your order",
    id
  );

  const sent = await sendEmail({ to: order.user.email, ...emailData });

  if (!sent) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Review reminder sent" });
}
