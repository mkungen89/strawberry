import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await db.portfolioProject.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, service, category, description, imageUrl, gradient, featured, published, sortOrder } = body;

  if (!title || !service || !category || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const project = await db.portfolioProject.create({
    data: {
      title,
      service,
      category,
      description,
      imageUrl: imageUrl || null,
      gradient: gradient || "from-purple-600 via-pink-600 to-rose-600",
      featured: featured ?? false,
      published: published ?? true,
      sortOrder: sortOrder ?? 0,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
