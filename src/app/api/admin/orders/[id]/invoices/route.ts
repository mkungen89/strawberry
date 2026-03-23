import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// Generate invoice number: VEX-2026-0001
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.invoice.count({
    where: {
      invoiceNumber: { startsWith: `VEX-${year}` },
    },
  });
  return `VEX-${year}-${String(count + 1).padStart(4, "0")}`;
}

// List invoices for an order
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const invoices = await db.invoice.findMany({
    where: { orderId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invoices);
}

// Create a new invoice for an order
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
  const { amount, currency, dueDate, notes } = body;

  const order = await db.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const invoiceNumber = await generateInvoiceNumber();

  const invoice = await db.invoice.create({
    data: {
      orderId: id,
      invoiceNumber,
      amount: amount || order.totalPrice,
      currency: currency || order.currency || "USD",
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days default
      notes: notes || null,
      status: "SENT",
    },
  });

  return NextResponse.json(invoice);
}
