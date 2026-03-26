const USEAPI_TOKEN = process.env.USEAPI_TOKEN;
const BASE = "https://api.useapi.net/v3/midjourney";
const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/midjourney`;

export function isMidjourneyEnabled() {
  return !!USEAPI_TOKEN;
}

export async function submitMidjourneyImagine(
  prompt: string,
  conceptId: string
): Promise<string | null> {
  if (!USEAPI_TOKEN) return null;

  const res = await fetch(`${BASE}/jobs/imagine`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${USEAPI_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      stream: false,
      replyUrl: WEBHOOK_URL,
      replyRef: JSON.stringify({ conceptId, stage: "imagine" }),
    }),
  });

  if (!res.ok) {
    console.error(`[Midjourney] imagine failed: ${res.status} ${await res.text()}`);
    return null;
  }

  const data = await res.json();
  console.log(`[Midjourney] imagine job submitted: ${data.jobid} for concept ${conceptId}`);
  return data.jobid as string;
}

export async function submitMidjourneyUpscale(
  jobId: string,
  conceptId: string
): Promise<string | null> {
  if (!USEAPI_TOKEN) return null;

  const res = await fetch(`${BASE}/jobs/button`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${USEAPI_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobId,
      button: "U1",
      stream: false,
      replyUrl: WEBHOOK_URL,
    }),
  });

  if (!res.ok) {
    console.error(`[Midjourney] upscale failed: ${res.status} ${await res.text()}`);
    return null;
  }

  const data = await res.json();
  console.log(`[Midjourney] upscale job submitted: ${data.jobid} for concept ${conceptId}`);
  return data.jobid as string;
}
