import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// Create concepts for an order (admin)
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
  const { concepts } = body;

  const order = await db.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const created = await Promise.all(
    concepts.map((c: { title: string; description?: string; imageUrl?: string; fileUrl?: string }, i: number) =>
      db.orderConcept.create({
        data: {
          orderId: id,
          title: c.title,
          description: c.description || null,
          imageUrl: c.imageUrl || null,
          fileUrl: c.fileUrl || null,
          sortOrder: i,
          status: "PENDING",
        },
      })
    )
  );

  // Log activity
  await db.orderActivity.create({
    data: {
      orderId: id,
      action: "CONCEPTS_ADDED",
      description: `${created.length} concept(s) added for customer review`,
      actorName: session.user.name || "Admin",
    },
  });

  // Auto-change status to REVIEW
  await db.order.update({
    where: { id },
    data: { status: "REVIEW" },
  });

  return NextResponse.json(created);
}
