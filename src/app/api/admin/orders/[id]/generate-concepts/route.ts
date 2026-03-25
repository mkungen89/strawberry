import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Service-specific prompt instructions
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

    "web-app": `You are a product designer. Generate 3 distinct web app architecture/design concepts. Each should describe:
- Core feature set and user flow
- UI framework/style recommendation
- Navigation structure
- Key differentiator from alternatives
- Tech stack suggestion`,

    "streaming-setup": `You are a streaming production specialist. Generate 3 distinct streaming overlay/setup concepts. Each should describe:
- Overlay theme and visual style
- Scenes to include (starting, BRB, gaming, just chatting, etc.)
- Alert animations style
- Color palette
- A Midjourney prompt for the overlay preview`,
  };

  return map[serviceSlug] || `You are a creative professional at a digital agency. Generate 3 distinct delivery concepts for the service: ${serviceName}. Each concept should describe the approach, visual direction, and key deliverables.`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      service: true,
      user: { select: { name: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const details = order.details as { description?: string; packageName?: string };
  const techStack = order.techStack as Record<string, string> | null;

  const brief = details?.description || "(No description provided)";
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
      "description": "Detailed description of this concept (150-250 words). Be specific, creative, and directly reference the customer's brief.",
      "midjourneyPrompt": "A ready-to-use Midjourney prompt to visualize this concept (or null if not applicable for this service type)"
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

Generate 3 clearly differentiated concepts that directly address what the customer described. Make each concept genuinely distinct in approach, not just minor variations.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "{}";

    let parsed: { concepts: Array<{ title: string; description: string; midjourneyPrompt: string | null }> };
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON", raw: text }, { status: 500 });
    }

    if (!parsed.concepts || !Array.isArray(parsed.concepts)) {
      return NextResponse.json({ error: "AI response missing concepts array", raw: text }, { status: 500 });
    }

    return NextResponse.json({ concepts: parsed.concepts, brief, service: order.service.name });
  } catch (error) {
    console.error("[GenerateConcepts] AI error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI generation failed" },
      { status: 500 }
    );
  }
}
