import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const referrals = await db.referral.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      referrer: { select: { name: true, email: true } },
      referred: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(referrals);
}
