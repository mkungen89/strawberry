export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";
import { sendEmail, orderConfirmationEmail } from "@/lib/email";
import { orderInQueueEmail } from "@/lib/email-templates";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-data";

async function triggerLandingPageSetup(
  orderId: string,
  customerName: string,
  customerEmail: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vexcraft.io";
  const secret = process.env.INTERNAL_API_SECRET ?? "";

  await fetch(`${appUrl}/api/landing-pages/setup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": secret,
    },
    body: JSON.stringify({ orderId, customerName, customerEmail }),
  }).catch((e) => console.error("[Stripe webhook] Landing page setup call failed:", e.message));
}

async function handleSubscriptionUpsert(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  if (!userId) return;

  const priceId = sub.items.data[0]?.price.id;
  const plan = SUBSCRIPTION_PLANS.find(
    (p) => process.env[`STRIPE_PRICE_${p.slug.toUpperCase()}`] === priceId
  ) ?? SUBSCRIPTION_PLANS.find((p) => sub.metadata?.planSlug === p.slug);

  // current_period_end moved from Subscription to SubscriptionItem in newer Stripe SDK
  const periodEnd = sub.items.data[0]?.current_period_end ?? 0;

  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId ?? "",
      planSlug: plan?.slug ?? sub.metadata?.planSlug ?? "unknown",
      status: sub.status,
      currentPeriodEnd: new Date(periodEnd * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    update: {
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId ?? "",
      planSlug: plan?.slug ?? sub.metadata?.planSlug ?? "unknown",
      status: sub.status,
      currentPeriodEnd: new Date(periodEnd * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  if (!userId) return;

  await db.subscription.updateMany({
    where: { stripeSubscriptionId: sub.id },
    data: { status: "canceled", cancelAtPeriodEnd: false },
  });
}

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

  // Subscription lifecycle events
  if (event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated") {
    await handleSubscriptionUpsert(event.data.object as Stripe.Subscription);
  }

  if (event.type === "customer.subscription.deleted") {
    await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
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

      // Trigger landing page automation for landing-page-design service
      if (order.service?.name?.toLowerCase().includes("landing page") && order.user?.email) {
        triggerLandingPageSetup(
          orderId,
          order.user.name || "Customer",
          order.user.email
        ).catch(() => {});
      }

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
