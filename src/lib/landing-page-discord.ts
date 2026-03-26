const WEBHOOK_URL = process.env.DISCORD_STUDIO_WEBHOOK_URL;

async function sendDiscordEmbed(embed: object) {
  if (!WEBHOOK_URL) {
    console.warn("[Discord] DISCORD_STUDIO_WEBHOOK_URL not set — skipping notification");
    return;
  }

  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  }).catch((e) => console.error("[Discord] Webhook failed:", e.message));
}

export async function notifyRepoCreated(
  orderId: string,
  repoUrl: string,
  previewUrl: string
): Promise<void> {
  await sendDiscordEmbed({
    title: "🏗️ LANDING PAGE REPO CREATED",
    color: 0x9333ea,
    fields: [
      { name: "Order ID", value: orderId, inline: true },
      { name: "GitHub", value: `[View repo](${repoUrl})`, inline: true },
      { name: "Preview", value: `[Open preview](${previewUrl})`, inline: false },
    ],
    footer: { text: "Vexcraft Automation" },
    timestamp: new Date().toISOString(),
  });
}

export async function notifyBuildSuccess(
  orderId: string,
  vercelUrl: string,
  buildTime: string
): Promise<void> {
  await sendDiscordEmbed({
    title: "✅ BUILD SUCCESS",
    color: 0x22c55e,
    fields: [
      { name: "Order ID", value: orderId, inline: true },
      { name: "Build Time", value: buildTime, inline: true },
      { name: "Preview", value: `[Open preview](${vercelUrl})`, inline: false },
    ],
    footer: { text: "Vexcraft Automation" },
    timestamp: new Date().toISOString(),
  });
}

export async function notifyBuildFailed(
  orderId: string,
  error: string,
  suggestedFix: string
): Promise<void> {
  await sendDiscordEmbed({
    title: "❌ BUILD FAILED",
    color: 0xef4444,
    fields: [
      { name: "Order ID", value: orderId, inline: true },
      { name: "Error", value: error.slice(0, 1024), inline: false },
      { name: "💡 Suggestion", value: suggestedFix, inline: false },
    ],
    footer: { text: "Fix and push to rebuild" },
    timestamp: new Date().toISOString(),
  });
}

export async function notifyDeployApproved(
  orderId: string,
  approvedBy: string
): Promise<void> {
  await sendDiscordEmbed({
    title: "🚀 DEPLOYMENT APPROVED",
    color: 0x3b82f6,
    fields: [
      { name: "Order ID", value: orderId, inline: true },
      { name: "Approved by", value: approvedBy, inline: true },
    ],
    footer: { text: "Vexcraft Automation" },
    timestamp: new Date().toISOString(),
  });
}
