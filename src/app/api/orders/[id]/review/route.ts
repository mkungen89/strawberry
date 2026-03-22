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
  const { rating, comment } = await req.json();

  // Validate inputs
  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }
  if (!comment?.trim()) {
    return NextResponse.json({ error: "Comment is required" }, { status: 400 });
  }

  // Verify order belongs to user and is COMPLETED
  const order = await db.order.findFirst({
    where: { id, userId: session.user.id },
    include: { review: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "COMPLETED") {
    return NextResponse.json({ error: "Order must be completed to leave a review" }, { status: 400 });
  }
  if (order.review) {
    return NextResponse.json({ error: "Review already submitted" }, { status: 409 });
  }

  const review = await db.review.create({
    data: {
      userId: session.user.id,
      orderId: id,
      rating,
      comment: comment.trim(),
    },
  });

  return NextResponse.json(review, { status: 201 });
}
