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

  const order = await db.order.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (order.briefLocked) {
    return NextResponse.json(
      { error: "Brief is locked. Work has already started on your order." },
      { status: 403 }
    );
  }

  const details = (order.details as Record<string, string>) || {};
  details.description = description;

  const updated = await db.order.update({
    where: { id },
    data: { details },
  });

  return NextResponse.json(updated);
}
