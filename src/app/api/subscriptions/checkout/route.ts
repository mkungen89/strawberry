import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-data";

/**
 * Get or create a Stripe Price for a subscription plan.
 * Price IDs can be set via env vars (STRIPE_PRICE_CREATOR etc.)
 * for production. On first run without env var, creates the product + price.
 */
async function getOrCreateStripePriceId(planSlug: string): Promise<string> {
  // Check env var first (preferred for production)
  const envKey = `STRIPE_PRICE_${planSlug.toUpperCase()}`;
  const envPriceId = process.env[envKey];
  if (envPriceId) return envPriceId;

  const plan = SUBSCRIPTION_PLANS.find((p) => p.slug === planSlug);
  if (!plan) throw new Error(`Plan not found: ${planSlug}`);

  // Search for existing product by metadata
  const products = await stripe.products.search({
    query: `metadata["vexcraft_plan"]:"${planSlug}"`,
  });

  let productId: string;
  if (products.data.length > 0) {
    productId = products.data[0].id;
  } else {
    // Create product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.tagline,
      metadata: { vexcraft_plan: planSlug },
    });
    productId = product.id;
  }

  // Check for existing recurring price on this product
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    type: "recurring",
  });

  if (prices.data.length > 0) {
    return prices.data[0].id;
  }

  // Create price in USD cents
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: Math.round(plan.price * 100),
    currency: "usd",
    recurring: { interval: "month" },
    metadata: { vexcraft_plan: planSlug },
  });

  console.log(`[Stripe] Created price ${price.id} for plan ${planSlug}. Add to .env: ${envKey}=${price.id}`);
  return price.id;
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { planSlug } = await req.json();

  const plan = SUBSCRIPTION_PLANS.find((p) => p.slug === planSlug);
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  // Check if user already has an active subscription
  const existing = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (existing && existing.status === "active" && !existing.cancelAtPeriodEnd) {
    return NextResponse.json(
      { error: "You already have an active subscription. Manage it from your dashboard." },
      { status: 409 }
    );
  }

  // Get or create Stripe customer
  let stripeCustomerId = (
    await db.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    })
  )?.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: session.user.name,
      metadata: { userId: session.user.id },
    });
    stripeCustomerId = customer.id;
    await db.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId },
    });
  }

  const priceId = await getOrCreateStripePriceId(planSlug);

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId: session.user.id, planSlug },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/plans?cancelled=true`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ checkoutUrl: checkoutSession.url });
}
