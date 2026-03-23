import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { SERVICES } from "@/lib/services-data";
import { headers } from "next/headers";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 10 order attempts per 15 minutes per IP
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`orders:${ip}`, { maxRequests: 10, windowSeconds: 900 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await req.json();
  const { serviceSlug, packageName, price, details, techStack } = body;

  const serviceData = SERVICES.find((s) => s.slug === serviceSlug);
  if (!serviceData) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // Get or create service in DB
  let service = await db.service.findUnique({ where: { slug: serviceSlug } });
  if (!service) {
    service = await db.service.create({
      data: {
        slug: serviceData.slug,
        name: serviceData.name,
        description: serviceData.description,
        category: serviceData.category as never,
        basePrice: serviceData.basePrice,
        features: serviceData.features,
        popular: serviceData.popular,
      },
    });
  }

  // Create order
  const order = await db.order.create({
    data: {
      userId: session.user.id,
      serviceId: service.id,
      totalPrice: price,
      details: { description: details, packageName },
      techStack: techStack || undefined,
      status: "PENDING",
    },
  });

  // Create Stripe checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(price * 100),
          product_data: {
            name: `${serviceData.name} — ${packageName}`,
            description: details.slice(0, 200),
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId: order.id,
      userId: session.user.id,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/services/${serviceSlug}?cancelled=true`,
    customer_email: session.user.email,
  });

  // Save payment intent ID
  await db.order.update({
    where: { id: order.id },
    data: { stripePaymentId: checkoutSession.id },
  });

  return NextResponse.json({ checkoutUrl: checkoutSession.url });
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { service: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
