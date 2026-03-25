import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// Update brief (only if not locked)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;
  const { description } = await req.json();

  // Validate input
  if (typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }
  if (description.length > 5000) {
    return NextResponse.json({ error: "Description is too long (max 5000 characters)" }, { status: 400 });
  }

  // Fetch order first to check ownership and give a clear locked error
  const order = await db.order.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, briefLocked: true, details: true },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.briefLocked) {
    return NextResponse.json(
      { error: "Brief is locked. Work has already started on your order." },
      { status: 403 }
    );
  }

  // Atomic update: only applies if briefLocked is still false (guards against race condition)
  const details = (order.details as Record<string, string>) || {};
  details.description = description.trim();

  const result = await db.order.updateMany({
    where: { id, userId: session.user.id, briefLocked: false },
    data: { details },
  });

  if (result.count === 0) {
    // Brief was locked between our check and the update
    return NextResponse.json(
      { error: "Brief is locked. Work has already started on your order." },
      { status: 403 }
    );
  }

  const updated = await db.order.findUnique({ where: { id } });
  return NextResponse.json(updated);
}
