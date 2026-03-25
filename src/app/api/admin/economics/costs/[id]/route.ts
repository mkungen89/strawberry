import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

const RATES: Record<string, number> = { USD: 1.0, SEK: 0.092, EUR: 1.08 };

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name.trim();
  if (body.amountRaw !== undefined && body.currency !== undefined) {
    const cur = body.currency.toUpperCase();
    data.amountRaw = parseFloat(body.amountRaw);
    data.amountUsd = parseFloat(body.amountRaw) * (RATES[cur] ?? 1.0);
    data.currency = cur;
  }
  if (body.category !== undefined) data.category = body.category;
  if (body.notes !== undefined) data.notes = body.notes?.trim() || null;
  if (body.active !== undefined) data.active = body.active;

  const entry = await db.costEntry.update({ where: { id }, data });
  return NextResponse.json(entry);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await db.costEntry.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
