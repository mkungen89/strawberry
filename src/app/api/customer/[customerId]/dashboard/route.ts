import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

async function getAuthorizedUser(customerId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  // Allow user to view their own data, or admin to view any
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";
  const isSelf = session.user.id === customerId;
  if (!isAdmin && !isSelf) return null;
  return session;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;
  const session = await getAuthorizedUser(customerId);
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    // Fetch the user
    const user = await db.user.findUnique({
      where: { id: customerId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    // Fetch CM-related orders
    const orders = await db.order.findMany({
      where: {
        userId: customerId,
        service: { slug: "community-management" },
      },
      include: {
        service: { select: { name: true, slug: true } },
        package: { select: { name: true } },
        invoices: { orderBy: { createdAt: "desc" }, take: 10 },
        milestones: { orderBy: { sortOrder: "asc" } },
        messages: { orderBy: { createdAt: "desc" }, take: 20 },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch CM metrics for this customer
    const metrics = await db.cMMetrics.findMany({
      where: { customerId },
      orderBy: { recordedAt: "desc" },
      take: 30,
    }).catch(() => []);

    // Fetch content calendar
    const contentCalendar = await db.cMContent.findMany({
      where: { customerId },
      orderBy: { scheduledAt: "asc" },
      take: 30,
    }).catch(() => []);

    // Fetch feedback history
    const feedbackHistory = await db.cMFeedback.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }).catch(() => []);

    // Build dashboard data
    const activeOrder = orders.find(o =>
      ["PAID", "IN_PROGRESS", "REVIEW"].includes(o.status)
    );

    const dashboard = {
      customer: user,
      activeSubscription: activeOrder ? {
        id: activeOrder.id,
        service: activeOrder.service.name,
        package: activeOrder.package?.name ?? "—",
        status: activeOrder.status,
        startedAt: activeOrder.createdAt,
        nextInvoiceDate: null, // calculated from billing cycle
      } : null,
      allOrders: orders.map(o => ({
        id: o.id,
        service: o.service.name,
        package: o.package?.name,
        status: o.status,
        totalPrice: o.totalPrice,
        currency: o.currency,
        createdAt: o.createdAt,
      })),
      metrics,
      contentCalendar,
      feedbackHistory,
      invoices: orders.flatMap(o => o.invoices),
      recentMessages: activeOrder?.messages ?? [],
    };

    return NextResponse.json(dashboard);
  } catch (err) {
    console.error("[CM Dashboard]", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
