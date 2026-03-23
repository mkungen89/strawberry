import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { sendEmail, newMessageEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const { content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Verify order exists
  const order = await db.order.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const message = await db.orderMessage.create({
    data: {
      orderId: id,
      senderId: session.user.id,
      content: content.trim(),
      isAdmin: true,
    },
  });

  // Notify customer via email
  if (order.user?.email) {
    const emailData = newMessageEmail(order.user.name || "Customer", id);
    sendEmail({ to: order.user.email, ...emailData }).catch(() => {});
  }

  return NextResponse.json(message);
}
