import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { isMidjourneyEnabled, submitMidjourneyUpscale } from "@/lib/image-generation";

// Get concepts for an order
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;
  const order = await db.order.findFirst({ where: { id, userId: session.user.id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const concepts = await db.orderConcept.findMany({
    where: { orderId: id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(concepts);
}

// Customer selects a concept
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;
  const { conceptId, feedback } = await req.json();

  const order = await db.order.findFirst({ where: { id, userId: session.user.id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (conceptId) {
    // Verify the concept belongs to this order before selecting it
    const concept = await db.orderConcept.findFirst({
      where: { id: conceptId, orderId: id },
    });
    if (!concept) {
      return NextResponse.json({ error: "Concept not found" }, { status: 404 });
    }

    // Find all deliverables for the same conceptIndex (e.g. banner + avatar of same concept)
    const allDeliverables = await db.orderConcept.findMany({
      where: { orderId: id, conceptIndex: concept.conceptIndex },
    });

    // Deselect all, then select all deliverables of the chosen concept
    await db.orderConcept.updateMany({
      where: { orderId: id },
      data: { isSelected: false },
    });
    await db.orderConcept.updateMany({
      where: { orderId: id, conceptIndex: concept.conceptIndex },
      data: { isSelected: true },
    });
    // Store feedback on the clicked concept only
    if (feedback) {
      await db.orderConcept.update({
        where: { id: conceptId },
        data: { feedback },
      });
    }

    const deliverableLabels = allDeliverables.map(d => d.deliverableLabel).join(" + ");
    await db.orderActivity.create({
      data: {
        orderId: id,
        action: "CONCEPT_SELECTED",
        description: `Customer selected concept "${concept.title.split(" — ")[0]}" (${deliverableLabels})`,
        actorName: session.user.name || "Customer",
      },
    });

    // Auto-trigger Midjourney upscale for ALL deliverables of this concept
    if (isMidjourneyEnabled()) {
      for (const deliverable of allDeliverables) {
        if (!deliverable.midjourneyJobId) continue;
        const jobId = deliverable.midjourneyJobId;
        const delivId = deliverable.id;
        submitMidjourneyUpscale(jobId, delivId)
          .then(async (upscaleJobId) => {
            if (upscaleJobId) {
              await db.orderConcept.update({
                where: { id: delivId },
                data: { midjourneyJobId: upscaleJobId },
              });
              console.log(`[Concepts] Upscale job ${upscaleJobId} submitted for ${deliverable.deliverableLabel} (${delivId})`);
            }
          })
          .catch((err) =>
            console.error(`[Concepts] Upscale failed for ${deliverable.deliverableLabel} (${delivId}):`, err)
          );
      }
    }
  }

  const concepts = await db.orderConcept.findMany({
    where: { orderId: id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(concepts);
}
