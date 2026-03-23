import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const members = await db.teamMember.findMany({
    include: {
      tasks: {
        where: { status: { not: "DONE" } },
        select: {
          id: true,
          title: true,
          status: true,
          progress: true,
          dueDate: true,
          priority: true,
          project: { select: { title: true, color: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, role, avatar } = body;

  const member = await db.teamMember.create({
    data: { name, role, avatar },
    include: { tasks: true },
  });

  return NextResponse.json(member, { status: 201 });
}
