/**
 * Auto-generates 3 AI concepts from a customer's order brief
 * and saves them to the database. Called automatically when an
 * order transitions to IN_PROGRESS.
 */

import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";

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

  const details = order.details as { description?: string; packageName?: string };
  const techStack = order.techStack as Record<string, string> | null;

  const brief = details?.description?.trim() || "(No description provided)";
  const packageName = details?.packageName || "";
  const techStackText = techStack
    ? Object.entries(techStack).map(([k, v]) => `${k}: ${v}`).join(", ")
    : null;

  const serviceInstructions = getServiceInstructions(order.service.slug, order.service.name);

  const systemPrompt = `You are a senior creative director at Vexcraft, a digital agency. You generate structured creative concepts based on customer briefs.

ALWAYS respond with valid JSON only — no markdown, no extra text. The JSON must have this exact shape:
{
  "concepts": [
    {
      "title": "Concept name (short, 3-6 words)",
      "description": "Detailed description (150-250 words). Be specific and directly reference the customer brief.",
      "midjourneyPrompt": "Ready-to-use Midjourney prompt, or null if not applicable"
    }
  ]
}

${serviceInstructions}`;

  const userMessage = `Generate 3 concepts for this customer order:

**Service:** ${order.service.name}${packageName ? ` — ${packageName} package` : ""}
**Customer:** ${order.user?.name || "Unknown"}

**Customer Brief:**
${brief}
${techStackText ? `\n**Tech Stack / Requirements:**\n${techStackText}` : ""}

Generate 3 clearly differentiated concepts that directly address what the customer described.`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  db.aiUsageLog.create({
    data: {
      source: "concepts",
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      model: message.model,
      costUsd: (message.usage.input_tokens * 0.00000025) + (message.usage.output_tokens * 0.00000125),
      orderId: order.id,
    },
  }).catch(() => {});

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";

  let parsed: { concepts: Array<{ title: string; description: string; midjourneyPrompt: string | null }> };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`AI returned invalid JSON: ${text.slice(0, 200)}`);
  }

  if (!parsed.concepts?.length) throw new Error("No concepts in AI response");

  // Save concepts to DB — imageUrl is left null (no actual image yet).
  // Midjourney prompts are for admin use only; not stored here.
  await Promise.all(
    parsed.concepts.map((c, i) =>
      db.orderConcept.create({
        data: {
          orderId,
          title: c.title,
          description: c.description || null,
          imageUrl: null,
          sortOrder: i,
          status: "PENDING",
        },
      })
    )
  );

  // Log activity
  await db.orderActivity.create({
    data: {
      orderId,
      action: "CONCEPTS_ADDED",
      description: `3 AI-generated concepts created automatically from customer brief`,
      actorName: "Vexcraft AI",
    },
  });

  console.log(`[AutoConcepts] Generated and saved 3 concepts for order ${orderId}`);
}
