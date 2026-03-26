import { db } from "@/lib/db";
import { isStorageEnabled, uploadImageFromUrl } from "@/lib/storage";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

interface MidjourneyWebhookBody {
  jobid: string;
  status: string;
  request?: { replyRef?: string };
  response?: {
    attachments?: Array<{ url: string; proxy_url?: string }>;
    imageUx?: Array<{ id: number; url: string }>;
  };
}

export async function POST(req: Request) {
  let body: MidjourneyWebhookBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { jobid, status } = body;

  console.log(`[Midjourney] Webhook: ${jobid} status=${status}`);

  if (status !== "completed") {
    return Response.json({ ok: true });
  }

  // Look up concept by jobId
  const concept = await db.orderConcept.findFirst({
    where: { midjourneyJobId: jobid },
  });

  if (!concept) {
    console.log(`[Midjourney] No concept found for jobId ${jobid} — ignoring`);
    return Response.json({ ok: true });
  }

  const isUpscale = !!concept.imageUrl;

  // Extract image URL
  // For Backblaze upload prefer Discord attachment (proxy_url) — Midjourney CDN blocks server-side fetches (403)
  // For display fallback use imageUx[0] (Midjourney CDN direct)
  const imageUxUrl = body.response?.imageUx?.[0]?.url;
  const attachmentProxyUrl = body.response?.attachments?.[0]?.proxy_url;
  const attachmentUrl = body.response?.attachments?.[0]?.url;
  const rawUrl = imageUxUrl ?? attachmentUrl ?? attachmentProxyUrl;

  if (!rawUrl) {
    console.error(`[Midjourney] No image URL found in completed job ${jobid}`);
    return Response.json({ ok: true });
  }

  // Use attachment URL for Backblaze upload (avoids Midjourney CDN 403), display URL as fallback
  const uploadUrl = attachmentProxyUrl ?? attachmentUrl ?? imageUxUrl ?? rawUrl;

  let finalUrl = rawUrl;
  const storageKey = isUpscale ? `concepts/${concept.id}-final.png` : `concepts/${concept.id}.png`;

  if (isStorageEnabled()) {
    try {
      finalUrl = await uploadImageFromUrl(uploadUrl, storageKey);
      console.log(`[Midjourney] Image uploaded to Backblaze for concept ${concept.id} (${isUpscale ? "upscale" : "imagine"})`);
    } catch (err) {
      console.error(`[Midjourney] Backblaze upload failed, using direct URL:`, err);
    }
  }

  await db.orderConcept.update({
    where: { id: concept.id },
    // Keep midjourneyJobId after imagine so it can be used for upscale on concept selection
    data: isUpscale
      ? { imageUrl: finalUrl, midjourneyJobId: null }
      : { imageUrl: finalUrl },
  });

  console.log(`[Midjourney] imageUrl saved for concept ${concept.id} (${isUpscale ? "final upscale" : "imagine preview"}): ${finalUrl}`);

  if (isUpscale) {
    // Notify admin that final design is ready
    const order = await db.order.findUnique({
      where: { id: concept.orderId },
      include: { service: true, user: { select: { name: true, email: true } } },
    });

    if (order) {
      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "support@vexcraft.io";
      await sendEmail({
        to: adminEmail,
        subject: `Final design ready — ${order.service.name} order`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e5e5; padding: 40px 30px; border-radius: 12px;">
            <h2 style="color: #a855f6;">Final Design Ready</h2>
            <p>A customer has selected a concept and the final upscaled design is now ready for review.</p>
            <ul style="color: #ccc;">
              <li><strong>Order:</strong> #${order.id.slice(-8).toUpperCase()}</li>
              <li><strong>Service:</strong> ${order.service.name}</li>
              <li><strong>Customer:</strong> ${order.user?.name || "Unknown"}</li>
            </ul>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${order.id}" style="display: inline-block; background: #a855f6; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
              View Order →
            </a>
          </div>
        `,
      }).catch(() => {});

      await db.orderActivity.create({
        data: {
          orderId: order.id,
          action: "DESIGN_READY",
          description: `Final upscaled design generated for selected concept`,
          actorName: "Vexcraft AI",
        },
      }).catch(() => {});
    }
  }

  return Response.json({ ok: true });
}
