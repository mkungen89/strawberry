import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// Get activity log visible to customer (no internal notes)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;
  const order = await db.order.findFirst({ where: { id, userId: session.user.id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const activities = await db.orderActivity.findMany({
    where: {
      orderId: id,
      action: { notIn: ["NOTE_ADDED"] }, // Hide internal notes from customer
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json(activities);
}
