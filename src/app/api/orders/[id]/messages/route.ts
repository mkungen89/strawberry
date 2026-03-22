import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();

  // Verify order belongs to user
  const order = await db.order.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const message = await db.orderMessage.create({
    data: {
      orderId: id,
      senderId: session.user.id,
      content,
      isAdmin: false,
    },
  });

  return NextResponse.json(message);
}
