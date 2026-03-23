import nodemailer from "nodemailer";

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[Email] SMTP not configured — emails will be logged only.");
    return null;
  }

  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || "Vexcraft <noreply@vexcraft.io>";

  if (!transporter) {
    console.log(`[Email][LOG] To: ${options.to} | Subject: ${options.subject}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return true;
  } catch (err) {
    console.error("[Email] Failed to send:", err);
    return false;
  }
}

// Pre-built email templates
export function orderConfirmationEmail(customerName: string, serviceName: string, orderId: string) {
  return {
    subject: `Order confirmed — ${serviceName} | Vexcraft`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e5e5; padding: 40px 30px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #a855f6; margin: 0;">⚡ Vexcraft</h1>
        </div>
        <h2 style="color: white; margin-bottom: 10px;">Order Confirmed!</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for your order! We've received your payment and your project is now in our queue.</p>
        <div style="background: #1a1a2e; border: 1px solid #2a2a4a; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong style="color: #a855f6;">Service:</strong> ${serviceName}</p>
          <p style="margin: 0;"><strong style="color: #a855f6;">Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
        </div>
        <p>We'll notify you as soon as work begins. In the meantime, you can track your order in your <a href="https://vexcraft.io/dashboard" style="color: #a855f6;">dashboard</a>.</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">— The Vexcraft Team</p>
      </div>
    `,
  };
}

export function statusUpdateEmail(customerName: string, serviceName: string, orderId: string, newStatus: string) {
  const statusMessages: Record<string, string> = {
    IN_PROGRESS: "We've started working on your project! 🚀",
    REVIEW: "Your project is ready for review. Please check your dashboard to approve or request changes.",
    REVISION: "We're working on the revisions you requested.",
    COMPLETED: "Your project is complete! 🎉 Head to your dashboard to download your files and leave a review.",
  };

  const message = statusMessages[newStatus] || `Your order status has been updated to: ${newStatus.replace("_", " ")}`;

  return {
    subject: `Order update — ${serviceName} | Vexcraft`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e5e5; padding: 40px 30px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #a855f6; margin: 0;">⚡ Vexcraft</h1>
        </div>
        <h2 style="color: white; margin-bottom: 10px;">Order Update</h2>
        <p>Hi ${customerName},</p>
        <p>${message}</p>
        <div style="background: #1a1a2e; border: 1px solid #2a2a4a; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong style="color: #a855f6;">Service:</strong> ${serviceName}</p>
          <p style="margin: 0 0 8px 0;"><strong style="color: #a855f6;">Order:</strong> #${orderId.slice(-8).toUpperCase()}</p>
          <p style="margin: 0;"><strong style="color: #a855f6;">Status:</strong> ${newStatus.replace("_", " ")}</p>
        </div>
        <p><a href="https://vexcraft.io/orders/${orderId}" style="color: #a855f6;">View your order →</a></p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">— The Vexcraft Team</p>
      </div>
    `,
  };
}

export function newMessageEmail(customerName: string, orderId: string) {
  return {
    subject: `New message on your order | Vexcraft`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e5e5; padding: 40px 30px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #a855f6; margin: 0;">⚡ Vexcraft</h1>
        </div>
        <h2 style="color: white; margin-bottom: 10px;">New Message</h2>
        <p>Hi ${customerName},</p>
        <p>You have a new message from the Vexcraft team on your order.</p>
        <p><a href="https://vexcraft.io/orders/${orderId}" style="display: inline-block; background: #a855f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">View message →</a></p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">— The Vexcraft Team</p>
      </div>
    `,
  };
}
