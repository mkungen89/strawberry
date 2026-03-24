import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

async function getAuthorizedUser(customerId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";
  const isSelf = session.user.id === customerId;
  if (!isAdmin && !isSelf) return null;
  return session;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;
  if (!await getAuthorizedUser(customerId)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();
  const { rating, comment, category } = body;

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  }

  try {
    const feedback = await db.cMFeedback.create({
      data: {
        customerId,
        rating: Number(rating),
        comment: comment?.trim() ?? "",
        category: category ?? "GENERAL",
      },
    }).catch(async () => {
      // Fallback: log to OrderNote on the most recent CM order
      const order = await db.order.findFirst({
        where: { userId: customerId, service: { slug: "community-management" } },
        orderBy: { createdAt: "desc" },
      });
      if (order) {
        await db.orderNote.create({
          data: {
            orderId: order.id,
            authorName: "Customer (Feedback)",
            content: `⭐ Rating: ${rating}/5\nCategory: ${category ?? "GENERAL"}\n\n${comment ?? ""}`,
          },
        });
      }
      return { id: "fallback", customerId, rating, comment, category, createdAt: new Date() };
    });

    return NextResponse.json({ ok: true, feedback });
  } catch (err) {
    console.error("[CM Feedback]", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;
  if (!await getAuthorizedUser(customerId)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const feedback = await db.cMFeedback.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    }).catch(() => []);

    return NextResponse.json(feedback);
  } catch (err) {
    console.error("[CM Feedback GET]", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
