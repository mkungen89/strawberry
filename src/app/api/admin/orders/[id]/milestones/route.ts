import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// List milestones for an order
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const milestones = await db.milestone.findMany({
    where: { orderId: id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(milestones);
}

// Create milestones for an order (batch)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { milestones } = body;

  const order = await db.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Validate percentages sum to 100
  const totalPercentage = milestones.reduce(
    (sum: number, m: { percentage: number }) => sum + m.percentage,
    0
  );
  if (Math.abs(totalPercentage - 100) > 0.01) {
    return NextResponse.json(
      { error: "Milestone percentages must sum to 100%" },
      { status: 400 }
    );
  }

  // Create all milestones
  const created = await Promise.all(
    milestones.map(
      (m: { title: string; description?: string; percentage: number; dueDate?: string }, i: number) =>
        db.milestone.create({
          data: {
            orderId: id,
            title: m.title,
            description: m.description || null,
            amount: (order.totalPrice * m.percentage) / 100,
            currency: order.currency || "USD",
            percentage: m.percentage,
            sortOrder: i,
            dueDate: m.dueDate ? new Date(m.dueDate) : null,
          },
        })
    )
  );

  // Update order payment type
  await db.order.update({
    where: { id },
    data: { paymentType: "MILESTONE" },
  });

  return NextResponse.json(created);
}

// Update a single milestone status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id: orderId } = await params;
  const { milestoneId, status } = await req.json();

  const milestone = await db.milestone.update({
    where: { id: milestoneId, orderId },
    data: {
      status,
      completedAt: status === "COMPLETED" || status === "PAID" ? new Date() : undefined,
      paidAt: status === "PAID" ? new Date() : undefined,
    },
  });

  return NextResponse.json(milestone);
}
