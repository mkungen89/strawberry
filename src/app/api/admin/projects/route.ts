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

  const projects = await db.project.findMany({
    include: {
      tasks: {
        select: { id: true, status: true, progress: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { title, description, category, color } = body;

  const project = await db.project.create({
    data: {
      title,
      description,
      category: category || "GENERAL",
      color: color || "#9333ea",
    },
    include: {
      tasks: { select: { id: true, status: true, progress: true } },
    },
  });

  return NextResponse.json(project, { status: 201 });
}
