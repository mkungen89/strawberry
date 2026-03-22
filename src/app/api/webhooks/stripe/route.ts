export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

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
      await db.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          invoiceUrl: typeof session.invoice === "string" ? session.invoice : undefined,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
