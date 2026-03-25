"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailSender = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const db_1 = require("@/lib/db");
class EmailSender {
    constructor() {
        const host = process.env.SMTP_HOST || 'mail.spacemail.com';
        const port = parseInt(process.env.SMTP_PORT || '465');
        const secure = process.env.SMTP_SECURE === 'true';
        const user = process.env.EMAIL_ACCOUNT || '';
        const pass = process.env.EMAIL_PASSWORD || '';
        if (!user || !pass) {
            throw new Error('Email credentials not configured in .env');
        }
        this.transporter = nodemailer_1.default.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
        });
        console.log(`[EmailSender] Configured SMTP: ${host}:${port} (secure: ${secure})`);
    }
    /**
     * Send email via SMTP
     */
    async sendEmail(options) {
        const { to, subject, body, inReplyTo, references } = options;
        const html = this.formatEmailBody(body);
        const mailOptions = {
            from: `Vexcraft Support <${process.env.EMAIL_ACCOUNT}>`,
            to,
            cc: 'support@vexcraft.io',
            subject,
            html,
            text: body,
        };
        // Add threading headers if replying
        if (inReplyTo) {
            mailOptions.inReplyTo = inReplyTo;
            mailOptions.references = references || inReplyTo;
        }
        await this.transporter.sendMail(mailOptions);
        console.log(`[EmailSender] Sent email to ${to}`);
    }
    /**
     * Format email body with Vexcraft signature
     */
    formatEmailBody(body) {
        return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        ${body.replace(/\n/g, '<br>')}
        
        <br><br>
        <div style="border-top: 2px solid #9333ea; padding-top: 16px; margin-top: 24px;">
          <p style="margin: 0; font-size: 14px;">
            <strong>Best regards,</strong><br>
            Elin (AI Assistant)<br>
            <span style="color: #9333ea; font-weight: 600;">Vexcraft Support Team</span>
          </p>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
            🌐 <a href="https://vexcraft.io" style="color: #9333ea; text-decoration: none;">vexcraft.io</a><br>
            📧 support@vexcraft.io
          </p>
        </div>
      </div>
    `;
    }
    /**
     * Send approved draft
     */
    async sendApprovedDraft(draftId, approvedBy) {
        const draft = await db_1.db.emailDraft.findUnique({
            where: { id: draftId },
        });
        if (!draft) {
            throw new Error(`Draft ${draftId} not found`);
        }
        if (draft.approved) {
            throw new Error('Draft already sent');
        }
        // Get the email thread separately
        const thread = await db_1.db.emailThread.findUnique({
            where: { id: draft.emailThreadId },
        });
        if (!thread) {
            throw new Error('Email thread not found');
        }
        try {
            // Send the email
            await this.sendEmail({
                to: draft.to,
                subject: draft.subject,
                body: draft.body,
                inReplyTo: thread.inReplyTo || undefined,
                references: thread.messageId || undefined,
            });
            // Mark as approved and sent
            await db_1.db.emailDraft.update({
                where: { id: draftId },
                data: {
                    approved: true,
                    approvedAt: new Date(),
                    approvedBy,
                },
            });
            await db_1.db.emailThread.update({
                where: { id: thread.id },
                data: {
                    status: 'SENT',
                    sentAt: new Date(),
                },
            });
            console.log(`[EmailSender] Draft ${draftId} sent successfully`);
        }
        catch (error) {
            console.error(`[EmailSender] Failed to send draft ${draftId}:`, error);
            await db_1.db.emailThread.update({
                where: { id: thread.id },
                data: {
                    status: 'FAILED',
                    failureReason: error instanceof Error ? error.message : 'Unknown error',
                },
            });
            throw error;
        }
    }
}
exports.EmailSender = EmailSender;
/**
 * Standalone test
 */
if (require.main === module) {
    const sender = new EmailSender();
    console.log('[EmailSender] Ready to send emails');
}
