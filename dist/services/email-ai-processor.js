"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailAIProcessor = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const db_1 = require("@/lib/db");
const ELIN_SYSTEM_PROMPT = `You are Elin, the AI customer support assistant for Vexcraft — a global digital agency.

**Your role:**
- Respond professionally and warmly to customer emails
- Provide helpful information about Vexcraft's services (web development, Discord bots, streaming setups, branding, SEO, etc.)
- If you don't know something specific, suggest the customer reaches out to the team for details
- Keep responses concise but complete
- Use a friendly, professional tone
- Sign emails with: "Best regards, Elin (AI Assistant) | Vexcraft Support Team"

**Company info:**
- Website: https://vexcraft.io
- Main contact: support@vexcraft.io
- Services: Discord setups, YouTube growth, websites, apps, branding, SEO, streaming tech

**Instructions:**
- If customer asks for a quote → suggest they visit the website or email for a custom proposal
- If technical issue → acknowledge and say a team member will follow up
- If general question → answer helpfully
- Always be polite and helpful`;
class EmailAIProcessor {
    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY not set in .env');
        }
        this.anthropic = new sdk_1.default({ apiKey });
    }
    /**
     * Generate AI response using Claude Haiku
     */
    async generateResponse(email, subject) {
        const userPrompt = `Subject: ${subject}\n\nEmail:\n${email}`;
        const message = await this.anthropic.messages.create({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 1024,
            system: ELIN_SYSTEM_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: userPrompt,
                },
            ],
        });
        const response = message.content[0];
        if (response.type !== 'text') {
            throw new Error('Unexpected response type from Claude');
        }
        return response.text;
    }
    /**
     * Process pending emails and generate AI drafts
     */
    async processPendingEmails() {
        const pending = await db_1.db.emailThread.findMany({
            where: { status: 'PENDING' },
            orderBy: { receivedAt: 'asc' },
            take: 10, // Process max 10 at a time
        });
        console.log(`[EmailAI] Processing ${pending.length} pending emails...`);
        for (const thread of pending) {
            try {
                console.log(`[EmailAI] Generating response for ${thread.id}...`);
                const aiResponse = await this.generateResponse(thread.originalEmail, thread.subject);
                // Update thread with AI response
                await db_1.db.emailThread.update({
                    where: { id: thread.id },
                    data: {
                        aiResponse,
                        status: 'DRAFT',
                        processedAt: new Date(),
                    },
                });
                // Create draft for manual review
                await db_1.db.emailDraft.create({
                    data: {
                        emailThreadId: thread.id,
                        to: thread.from,
                        subject: `Re: ${thread.subject}`,
                        body: aiResponse,
                        approved: false,
                    },
                });
                console.log(`[EmailAI] Created draft for ${thread.id}`);
            }
            catch (error) {
                console.error(`[EmailAI] Failed to process ${thread.id}:`, error);
                // Mark as failed
                await db_1.db.emailThread.update({
                    where: { id: thread.id },
                    data: {
                        status: 'FAILED',
                        failureReason: error instanceof Error ? error.message : 'Unknown error',
                    },
                });
            }
        }
        console.log('[EmailAI] Processing complete');
    }
}
exports.EmailAIProcessor = EmailAIProcessor;
/**
 * Standalone runner for testing
 */
if (require.main === module) {
    const processor = new EmailAIProcessor();
    processor.processPendingEmails().then(() => {
        console.log('[EmailAI] Manual processing complete');
        process.exit(0);
    });
}
