import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { isMidjourneyEnabled, submitMidjourneyUpscale } from "@/lib/image-generation";

// Create concepts for an order (admin)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { concepts } = body;

  const order = await db.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const created = await Promise.all(
    concepts.map((c: { title: string; description?: string; imageUrl?: string; fileUrl?: string }, i: number) =>
      db.orderConcept.create({
        data: {
          orderId: id,
          title: c.title,
          description: c.description || null,
          imageUrl: c.imageUrl || null,
          fileUrl: c.fileUrl || null,
          sortOrder: i,
          status: "PENDING",
        },
      })
    )
  );

  // Log activity
  await db.orderActivity.create({
    data: {
      orderId: id,
      action: "CONCEPTS_ADDED",
      description: `${created.length} concept(s) added for customer review`,
      actorName: session.user.name || "Admin",
    },
  });

  // Auto-change status to REVIEW
  await db.order.update({
    where: { id },
    data: { status: "REVIEW" },
  });

  return NextResponse.json(created);
}

// Retry upscale for all selected concepts in this order (admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  if (!isMidjourneyEnabled()) {
    return NextResponse.json({ error: "Midjourney not configured" }, { status: 400 });
  }

  const { id } = await params;

  // Find all selected concepts that still have a midjourneyJobId (imagine jobId)
  const selected = await db.orderConcept.findMany({
    where: { orderId: id, isSelected: true, midjourneyJobId: { not: null } },
  });

  if (!selected.length) {
    return NextResponse.json({ error: "No selected concepts with a job ID to upscale" }, { status: 400 });
  }

  const results: string[] = [];

  for (const concept of selected) {
    const upscaleJobId = await submitMidjourneyUpscale(concept.midjourneyJobId!, concept.id);
    if (upscaleJobId) {
      await db.orderConcept.update({
        where: { id: concept.id },
        data: { midjourneyJobId: upscaleJobId },
      });
      results.push(`${concept.deliverableLabel}: job ${upscaleJobId}`);
      console.log(`[Admin] Retry upscale job ${upscaleJobId} for concept ${concept.id} (${concept.deliverableLabel})`);
    } else {
      results.push(`${concept.deliverableLabel}: failed`);
    }
  }

  await db.orderActivity.create({
    data: {
      orderId: id,
      action: "UPSCALE_RETRY",
      description: `Admin retried upscale: ${results.join(", ")}`,
      actorName: session.user.name || "Admin",
    },
  });

  return NextResponse.json({ results });
}
