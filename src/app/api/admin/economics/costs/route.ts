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

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, amountRaw, currency, category, notes } = await req.json();
  if (!name?.trim() || !amountRaw || amountRaw <= 0) {
    return NextResponse.json({ error: "name and amountRaw are required." }, { status: 400 });
  }

  const cur = (currency ?? "USD").toUpperCase();
  const rate = RATES[cur] ?? 1.0;
  const entry = await db.costEntry.create({
    data: {
      name: name.trim(),
      amountRaw: parseFloat(amountRaw),
      amountUsd: parseFloat(amountRaw) * rate,
      currency: cur,
      category: category ?? "TOOL",
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
