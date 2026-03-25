import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// Get concepts for an order
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;
  const order = await db.order.findFirst({ where: { id, userId: session.user.id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const concepts = await db.orderConcept.findMany({
    where: { orderId: id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(concepts);
}

// Customer selects a concept
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;
  const { conceptId, feedback } = await req.json();

  const order = await db.order.findFirst({ where: { id, userId: session.user.id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (conceptId) {
    // Verify the concept belongs to this order before selecting it
    const concept = await db.orderConcept.findFirst({
      where: { id: conceptId, orderId: id },
    });
    if (!concept) {
      return NextResponse.json({ error: "Concept not found" }, { status: 404 });
    }

    // Deselect all, then select the chosen one
    await db.orderConcept.updateMany({
      where: { orderId: id },
      data: { isSelected: false },
    });
    await db.orderConcept.update({
      where: { id: conceptId },
      data: { isSelected: true, feedback: feedback || null },
    });

    // Log activity
    await db.orderActivity.create({
      data: {
        orderId: id,
        action: "CONCEPT_SELECTED",
        description: `Customer selected a concept`,
        actorName: session.user.name || "Customer",
      },
    });
  }

  const concepts = await db.orderConcept.findMany({
    where: { orderId: id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(concepts);
}
