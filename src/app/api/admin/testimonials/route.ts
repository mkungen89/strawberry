import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const testimonials = await db.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(testimonials);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, handle, service, stars, text, published, sortOrder } = await req.json();
  if (!name || !service || !text)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const t = await db.testimonial.create({
    data: { name, handle: handle || null, service, stars: stars ?? 5, text, published: published ?? true, sortOrder: sortOrder ?? 0 },
  });
  return NextResponse.json(t, { status: 201 });
}
