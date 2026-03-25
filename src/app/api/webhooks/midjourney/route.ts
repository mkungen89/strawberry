import { db } from "@/lib/db";
import { submitMidjourneyUpscale } from "@/lib/image-generation";
import { isStorageEnabled, uploadImageFromUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

interface MidjourneyWebhookBody {
  jobid: string;
  status: string;
  replyRef?: string;
  attachments?: Array<{ url: string; proxy_url?: string }>;
}

export async function POST(req: Request) {
  let body: MidjourneyWebhookBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { jobid, status, replyRef, attachments } = body;

  if (status !== "completed") {
    return Response.json({ ok: true });
  }

  if (!replyRef) return Response.json({ ok: true });

  let ref: { conceptId: string; stage: "imagine" | "upscale" };
  try {
    ref = JSON.parse(replyRef);
  } catch {
    return Response.json({ error: "Invalid replyRef" }, { status: 400 });
  }

  const { conceptId, stage } = ref;

  if (stage === "imagine") {
    // Midjourney generated a 2x2 grid — upscale the first image (U1)
    await submitMidjourneyUpscale(jobid, conceptId);
  } else if (stage === "upscale") {
    // Upscaled image ready — save to concept
    const discordUrl = attachments?.[0]?.url ?? attachments?.[0]?.proxy_url;
    if (!discordUrl) {
      console.error(`[Midjourney] No image URL in upscale callback for concept ${conceptId}`);
      return Response.json({ ok: true });
    }

    let imageUrl = discordUrl;

    // Upload to Backblaze for permanent storage
    if (isStorageEnabled()) {
      try {
        imageUrl = await uploadImageFromUrl(
          discordUrl,
          `concepts/${conceptId}.png`
        );
        console.log(`[Midjourney] Image uploaded to Backblaze for concept ${conceptId}`);
      } catch (err) {
        console.error(`[Midjourney] Backblaze upload failed, falling back to Discord URL:`, err);
      }
    }

    await db.orderConcept.update({
      where: { id: conceptId },
      data: { imageUrl },
    });

    console.log(`[Midjourney] imageUrl saved for concept ${conceptId}`);
  }

  return Response.json({ ok: true });
}
