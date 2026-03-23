import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// Get invoices for user's order
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;

  // Verify order belongs to user
  const order = await db.order.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const invoices = await db.invoice.findMany({
    where: { orderId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invoices);
}
