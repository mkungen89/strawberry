export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";
import { sendEmail, orderConfirmationEmail } from "@/lib/email";
import { orderInQueueEmail } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: Record<string, string>; invoice?: string | null; customer_email?: string };
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const order = await db.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          invoiceUrl: typeof session.invoice === "string" ? session.invoice : undefined,
        },
        include: {
          user: { select: { name: true, email: true } },
          service: { select: { name: true } },
        },
      });

      // Send order confirmation + queue notification email to customer
      if (order.user?.email) {
        // Send confirmation
        const confirmData = orderConfirmationEmail(
          order.user.name || "Customer",
          order.service?.name || "Service",
          orderId
        );
        sendEmail({ to: order.user.email, ...confirmData }).catch(() => {});

        // Send "in queue" notification
        const queueData = orderInQueueEmail(
          order.user.name || "Customer",
          order.service?.name || "Service",
          orderId
        );
        sendEmail({ to: order.user.email, ...queueData }).catch(() => {});
      }
    }
  }

  return NextResponse.json({ received: true });
}
