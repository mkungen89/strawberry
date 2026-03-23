import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "support@vexcraft.io";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;

  // Verify order belongs to user
  const order = await db.order.findFirst({
    where: { id, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(order.messages);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`order-msg:${ip}`, { maxRequests: 20, windowSeconds: 60 });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many messages." }, { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } });
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Verify order belongs to user
  const order = await db.order.findFirst({
    where: { id, userId: session.user.id },
    include: { service: { select: { name: true } }, user: { select: { name: true, email: true } } },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const message = await db.orderMessage.create({
    data: {
      orderId: id,
      senderId: session.user.id,
      content: content.trim(),
      isAdmin: false,
    },
  });

  // Notify admin via email
  sendEmail({
    to: ADMIN_EMAIL,
    subject: `New customer message — Order #${id.slice(-8).toUpperCase()} | Vexcraft`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e5e5; padding: 40px 30px; border-radius: 12px;">
        <h1 style="color: #a855f6; margin: 0 0 20px 0;">⚡ Vexcraft Admin</h1>
        <h2 style="color: white; margin-bottom: 10px;">New Customer Message</h2>
        <div style="background: #1a1a2e; border: 1px solid #2a2a4a; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong style="color: #a855f6;">Customer:</strong> ${order.user?.name || "Unknown"} (${order.user?.email || "—"})</p>
          <p style="margin: 0 0 8px 0;"><strong style="color: #a855f6;">Service:</strong> ${order.service?.name || "—"}</p>
          <p style="margin: 0 0 8px 0;"><strong style="color: #a855f6;">Order ID:</strong> #${id.slice(-8).toUpperCase()}</p>
          <p style="margin: 0;"><strong style="color: #a855f6;">Message:</strong></p>
          <p style="margin: 8px 0 0 0; padding: 12px; background: #0a0a1a; border-radius: 6px; color: #e5e5e5;">${content.trim()}</p>
        </div>
        <p><a href="https://vexcraft.io/admin/orders/${id}" style="display: inline-block; background: #a855f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">View Order & Reply →</a></p>
      </div>
    `,
  }).catch(() => {});

  return NextResponse.json(message);
}
