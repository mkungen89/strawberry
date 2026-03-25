/**
 * AI Chat Assistant (Elin) - powered by Claude
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const ELIN_SYSTEM_PROMPT = `You are Elin Nyström, a friendly and professional project coordinator at Vexcraft, a global digital agency.

**Your role:**
- Help visitors understand Vexcraft's services (Discord servers, websites, apps, graphics, video editing, streaming setups, etc.)
- Answer questions about pricing, timeline, and process
- Gather information about their project needs
- Be warm, professional, and solution-oriented
- Keep responses concise (2-4 sentences usually)

**About Vexcraft:**
- Global digital agency specializing in Discord, websites, apps, streaming, and creative services
- Custom pricing based on project scope
- Professional team with experience across tech and creative fields
- Fast turnaround times with high quality standards
- Website: https://vexcraft.io

**Tone:**
- Professional but friendly
- Enthusiastic about helping
- Clear and concise
- Use emojis sparingly (1-2 per message max)
- Ask follow-up questions when needed to understand their needs

**When a visitor asks about:**
- Pricing → explain it's custom based on their needs, ask what they're looking for
- Timeline → typically 1-4 weeks depending on complexity
- Services → briefly explain and ask what specific service interests them
- Getting started → guide them to fill out a project brief or contact form

If you don't know something specific, be honest and offer to connect them with the team.`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Generate an AI response from Elin
 */
export async function getElinResponse(
  conversationHistory: ChatMessage[]
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20241001",
      max_tokens: 300,
      system: ELIN_SYSTEM_PROMPT,
      messages: conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const firstContent = response.content[0];
    if (firstContent.type === "text") {
      return firstContent.text;
    }

    return "I'm here to help! What can I assist you with today?";
  } catch (error) {
    console.error("[AI Error]", error);
    // Fallback response on error
    return "Thanks for your message! I'm experiencing a brief technical issue. Please try again in a moment, or reach out to support@vexcraft.io if this persists.";
  }
}
