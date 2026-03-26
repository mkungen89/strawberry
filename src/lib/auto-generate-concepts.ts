/**
 * Auto-generates 3 AI concepts from a customer's order brief
 * and saves them to the database. Called automatically when an
 * order transitions to IN_PROGRESS.
 */

import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { isMidjourneyEnabled, submitMidjourneyImagine } from "@/lib/image-generation";
import { SERVICE_PLATFORMS, getServiceDeliverables } from "@/lib/services-data";

// Maps platform size dimensions to Midjourney --ar flag
function dimensionsToAspectRatio(dimensions: string): string | null {
  const match = dimensions.match(/^(\d+)[×x](\d+)/);
  if (!match) return null;
  const w = parseInt(match[1]);
  const h = parseInt(match[2]);
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

// Returns platform context text + primary Midjourney aspect ratio for the order
function getPlatformContext(serviceSlug: string, selectedPlatformIds: string[]): { text: string; primaryAr: string | null } {
  if (!selectedPlatformIds.length) return { text: "", primaryAr: null };

  const allPlatforms = SERVICE_PLATFORMS[serviceSlug] ?? [];
  const selected = allPlatforms.filter((p) => selectedPlatformIds.includes(p.id));
  if (!selected.length) return { text: "", primaryAr: null };

  const lines = selected.flatMap((p) =>
    p.sizes.map((s) => `- ${p.name} ${s.label}: ${s.dimensions}`)
  );

  // Primary AR = first size of first selected platform
  const primaryDimensions = selected[0].sizes[0].dimensions;
  const primaryAr = dimensionsToAspectRatio(primaryDimensions);

  return {
    text: `**Required output sizes (must be respected in Midjourney prompts):**\n${lines.join("\n")}`,
    primaryAr,
  };
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

function getServiceInstructions(serviceSlug: string, serviceName: string): string {
  const map: Record<string, string> = {
    "logo-branding": `You are a creative director specializing in brand identity. Generate 3 distinct logo/branding concepts. Each concept should have:
- A clear visual direction (e.g. minimalist wordmark, geometric icon, hand-drawn style)
- Color palette suggestion (2-3 colors with names)
- Typography style (serif, sans-serif, display, etc.)
- The feeling/emotion it conveys
- A Midjourney prompt to visualize it`,

    "social-media-kit": `You are a social media designer. Generate 3 distinct social media kit concepts. Each should describe:
- Overall visual theme and style
- Color scheme
- Graphic elements and patterns
- How it fits the platform aesthetic
- A Midjourney prompt for a sample banner`,

    "youtube-thumbnails": `You are a YouTube thumbnail specialist. Generate 3 distinct thumbnail style concepts. Each should describe:
- Layout and composition
- Color scheme and contrast approach
- Text style and placement
- Image/graphic elements
- A Midjourney prompt to visualize the style`,

    "discord-server": `You are a Discord server designer. Generate 3 distinct server setup concepts. Each should describe:
- Overall theme and atmosphere
- Category/channel structure
- Bot features to include
- Visual elements (banner, icon, role colors)
- Naming conventions for channels`,

    "website-design": `You are a UI/UX designer. Generate 3 distinct website design concepts. Each should describe:
- Layout style (single-page, multi-page, etc.)
- Visual style (modern, minimal, bold, etc.)
- Color palette
- Key sections and user flow
- A Midjourney prompt for the hero section`,

    "web-app": `You are a product designer. Generate 3 distinct web app concepts. Each should describe:
- Core feature set and user flow
- UI style recommendation
- Navigation structure
- Key differentiator
- Tech stack suggestion`,

    "streaming-setup": `You are a streaming production specialist. Generate 3 distinct streaming overlay/setup concepts. Each should describe:
- Overlay theme and visual style
- Scenes to include (starting, BRB, gaming, just chatting, etc.)
- Alert animations style
- Color palette
- A Midjourney prompt for the overlay preview`,

    "ai-video-shorts": `You are a short-form video director. Generate 3 distinct video concepts for short-form content. Each should describe:
- Visual style and pacing (fast cuts, cinematic, animated, etc.)
- Opening hook (first 2 seconds)
- Key scenes/moments
- On-screen text style
- A Midjourney prompt for a key frame that captures the visual style (will be used as reference for Runway video generation)`,
  };

  return map[serviceSlug] ?? `You are a creative professional at a digital agency. Generate 3 distinct delivery concepts for the service: ${serviceName}. Each concept should describe the approach, visual direction, and key deliverables.`;
}

export async function autoGenerateConcepts(orderId: string): Promise<void> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      service: true,
      user: { select: { name: true } },
    },
  });

  if (!order) throw new Error(`Order ${orderId} not found`);

  const details = order.details as { description?: string; packageName?: string; platforms?: string[] };
  const techStack = order.techStack as Record<string, string> | null;

  const brief = details?.description?.trim() || "(No description provided)";
  const packageName = details?.packageName || "";
  const techStackText = techStack
    ? Object.entries(techStack).map(([k, v]) => `${k}: ${v}`).join(", ")
    : null;

  const { text: platformText, primaryAr } = getPlatformContext(order.service.slug, details?.platforms ?? []);

  const serviceInstructions = getServiceInstructions(order.service.slug, order.service.name);
  const deliverables = getServiceDeliverables(order.service.slug, packageName);
  const hasMultipleDeliverables = deliverables.length > 1;

  // Build the prompt fields instruction based on deliverables
  const promptFieldsDoc = deliverables.length > 0
    ? deliverables.map(d =>
        `      "${d.type}Prompt": "Midjourney prompt for the ${d.label} (--ar ${d.ar}), or null"`
      ).join(",\n")
    : `      "midjourneyPrompt": "Ready-to-use Midjourney prompt, or null if not applicable"`;

  const arInstruction = deliverables.length > 0
    ? deliverables.map(d =>
        `- ${d.label}: append --ar ${d.ar} and include "${d.promptSuffix}"`
      ).join("\n")
    : primaryAr
      ? `When writing Midjourney prompts, always append --ar ${primaryAr} at the end.`
      : `When writing Midjourney prompts, choose an appropriate --ar flag (e.g. --ar 1:1 for logos, --ar 16:9 for banners).`;

  const systemPrompt = `You are a senior creative director at Vexcraft, a digital agency. You generate structured creative concepts based on customer briefs.

ALWAYS respond with valid JSON only — no markdown, no extra text. The JSON must have this exact shape:
{
  "concepts": [
    {
      "title": "Concept name (short, 3-6 words)",
      "description": "Detailed description (150-250 words). Be specific and directly reference the customer brief.",
${promptFieldsDoc}
    }
  ]
}

${serviceInstructions}

Each concept must include a separate Midjourney prompt for each deliverable:
${arInstruction}`;

  const userMessage = `Generate 3 concepts for this customer order:

**Service:** ${order.service.name}${packageName ? ` — ${packageName} package` : ""}
**Customer:** ${order.user?.name || "Unknown"}
${hasMultipleDeliverables ? `**Deliverables required:** ${deliverables.map(d => d.label).join(", ")}` : ""}

**Customer Brief:**
${brief}
${platformText ? `\n${platformText}` : ""}
${techStackText ? `\n**Tech Stack / Requirements:**\n${techStackText}` : ""}

Generate 3 clearly differentiated concepts that directly address what the customer described.`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  await db.aiUsageLog.create({
    data: {
      source: "concepts",
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      model: message.model,
      costUsd: (message.usage.input_tokens * 0.00000025) + (message.usage.output_tokens * 0.00000125),
      orderId: order.id,
    },
  }).catch(() => {});

  const raw = message.content[0].type === "text" ? message.content[0].text : "{}";
  const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

  let parsed: { concepts: Array<Record<string, string | null>> };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`AI returned invalid JSON: ${text.slice(0, 200)}`);
  }

  if (!parsed.concepts?.length) throw new Error("No concepts in AI response");

  // Save one OrderConcept per concept × deliverable
  // conceptIndex groups deliverables of the same concept together
  const savedRows: Array<{ conceptIndex: number; deliverableType: string; id: string; prompt: string | null }> = [];

  for (let conceptIdx = 0; conceptIdx < parsed.concepts.length; conceptIdx++) {
    const c = parsed.concepts[conceptIdx];
    const title = (c.title as string) || `Concept ${conceptIdx + 1}`;
    const description = (c.description as string) || null;

    if (deliverables.length > 0) {
      for (let dIdx = 0; dIdx < deliverables.length; dIdx++) {
        const d = deliverables[dIdx];
        const prompt = (c[`${d.type}Prompt`] as string | null) ?? null;
        const isMain = dIdx === 0;

        const saved = await db.orderConcept.create({
          data: {
            orderId,
            title: deliverables.length > 1 ? `${title} — ${d.label}` : title,
            description: isMain ? description : null,
            imageUrl: null,
            sortOrder: conceptIdx * 10 + dIdx,
            conceptIndex: conceptIdx,
            deliverableType: d.type,
            deliverableLabel: d.label,
            status: "PENDING",
          },
        });
        savedRows.push({ conceptIndex: conceptIdx, deliverableType: d.type, id: saved.id, prompt });
      }
    } else {
      // Service has no Midjourney deliverables (e.g. copywriting, discord-server)
      const prompt = (c.midjourneyPrompt as string | null) ?? null;
      const saved = await db.orderConcept.create({
        data: {
          orderId,
          title,
          description,
          imageUrl: null,
          sortOrder: conceptIdx,
          conceptIndex: conceptIdx,
          deliverableType: "main",
          deliverableLabel: "Design",
          status: "PENDING",
        },
      });
      savedRows.push({ conceptIndex: conceptIdx, deliverableType: "main", id: saved.id, prompt });
    }
  }

  // Trigger Midjourney imagine jobs for each row that has a prompt
  if (isMidjourneyEnabled()) {
    for (const row of savedRows) {
      if (!row.prompt) continue;
      submitMidjourneyImagine(row.prompt, row.id)
        .then(async (jobId) => {
          if (jobId) {
            await db.orderConcept.update({
              where: { id: row.id },
              data: { midjourneyJobId: jobId },
            });
            console.log(`[AutoConcepts] Saved jobId ${jobId} for concept ${row.id} (${row.deliverableType})`);
          }
        })
        .catch((err) =>
          console.error(`[AutoConcepts] Midjourney failed for concept ${row.id}:`, err)
        );
    }
  }

  // Log activity
  const deliverablesSummary = deliverables.length > 1
    ? ` (${deliverables.map(d => d.label).join(" + ")} per concept)`
    : "";
  await db.orderActivity.create({
    data: {
      orderId,
      action: "CONCEPTS_ADDED",
      description: `3 AI-generated concepts created automatically from customer brief${deliverablesSummary}`,
      actorName: "Vexcraft AI",
    },
  });

  console.log(`[AutoConcepts] Generated and saved concepts for order ${orderId} — ${savedRows.length} total rows`);
}
