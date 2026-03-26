const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN!;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const GITHUB_ORG = process.env.GITHUB_ORG || "vexcraft-io";
const BASE_URL = process.env.VEXCRAFT_WEBHOOK_BASE_URL || "https://vexcraft.io/api/webhooks";

async function vercelFetch(path: string, options: RequestInit = {}) {
  const teamQuery = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : "";
  const url = `https://api.vercel.com${path}${path.includes("?") ? "&" : "?"}${VERCEL_TEAM_ID ? `teamId=${VERCEL_TEAM_ID}` : ""}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vercel API error ${res.status} on ${path}: ${err}`);
  }

  return res.json();
}

export async function createVercelProject(
  orderId: string,
  githubRepo: string
): Promise<{ projectId: string; previewUrl: string }> {
  const projectName = `landing-page-${orderId}`;

  const project = await vercelFetch("/v10/projects", {
    method: "POST",
    body: JSON.stringify({
      name: projectName,
      framework: "nextjs",
      gitRepository: {
        type: "github",
        repo: `${GITHUB_ORG}/${githubRepo}`,
      },
      publicSource: false,
    }),
  });

  const projectId = project.id as string;

  // Register deployment webhook so Vercel notifies us on build events
  await vercelFetch(`/v1/integrations/webhooks`, {
    method: "POST",
    body: JSON.stringify({
      name: `vexcraft-build-${orderId}`,
      url: `${BASE_URL}/vercel`,
      events: ["deployment.created", "deployment.succeeded", "deployment.error", "deployment.canceled"],
      projectIds: [projectId],
    }),
  }).catch((e) => {
    console.warn("[Vercel] Could not register webhook:", e.message);
  });

  return {
    projectId,
    previewUrl: `https://${projectName}.vercel.app`,
  };
}

export async function getVercelDeploymentLogs(
  deploymentId: string
): Promise<string> {
  const data = await vercelFetch(
    `/v2/deployments/${deploymentId}/events?limit=100`
  ).catch(() => ({ events: [] }));

  const events: Array<{ type: string; payload?: { text?: string } }> =
    data.events ?? [];

  return events
    .filter((e) => e.type === "stdout" || e.type === "stderr")
    .map((e) => e.payload?.text ?? "")
    .join("\n");
}

export async function triggerRedeploy(
  projectId: string
): Promise<{ deploymentId: string }> {
  // Get latest deployment to redeploy
  const deploymentsData = await vercelFetch(
    `/v6/deployments?projectId=${projectId}&limit=1`
  );

  const latest = deploymentsData.deployments?.[0];
  if (!latest) throw new Error("No deployments found to redeploy");

  const redeploy = await vercelFetch(`/v13/deployments`, {
    method: "POST",
    body: JSON.stringify({
      name: latest.name,
      deploymentId: latest.uid,
      meta: { action: "redeploy" },
    }),
  });

  return { deploymentId: redeploy.id as string };
}
