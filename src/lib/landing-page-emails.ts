import { sendEmail } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vexcraft.io";

export async function sendPreviewReadyEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  previewUrl: string
): Promise<void> {
  await sendEmail({
    to: customerEmail,
    subject: "Your landing page preview is ready! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #9333ea;">Your landing page is live! 🚀</h2>
        <p>Hi ${customerName},</p>
        <p>Great news — your landing page preview is ready. Take a look and let us know what you think!</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${previewUrl}" style="background: #9333ea; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View Your Landing Page →
          </a>
        </div>
        <p>We'll keep making improvements — you'll be notified whenever there's an update.</p>
        <p>You can track your order at: <a href="${APP_URL}/orders/${orderId}">${APP_URL}/orders/${orderId}</a></p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 14px;">— The Vexcraft Team</p>
      </div>
    `,
  });
}

export async function sendBuildFailedEmail(
  customerEmail: string,
  customerName: string,
  orderId: string
): Promise<void> {
  await sendEmail({
    to: customerEmail,
    subject: "We're working on a small fix for your landing page",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #9333ea;">Quick update on your landing page</h2>
        <p>Hi ${customerName},</p>
        <p>We encountered a small technical issue during the build — nothing to worry about. Our team has been notified and is already working on a fix.</p>
        <p>You'll receive another email as soon as your preview is back online. This usually takes less than an hour.</p>
        <p>You can track your order here: <a href="${APP_URL}/orders/${orderId}">${APP_URL}/orders/${orderId}</a></p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 14px;">— The Vexcraft Team</p>
      </div>
    `,
  });
}

export async function sendDeliveryReadyEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  finalUrl: string,
  accessToken: string
): Promise<void> {
  await sendEmail({
    to: customerEmail,
    subject: "Your landing page is ready! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #9333ea;">Your landing page is live! 🎉</h2>
        <p>Hi ${customerName},</p>
        <p>Your landing page is fully ready and live!</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${finalUrl}" style="background: #9333ea; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Visit Your Landing Page →
          </a>
        </div>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; font-weight: bold;">Your access token (save this):</p>
          <code style="font-size: 14px; color: #7c3aed;">${accessToken}</code>
          <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">Use this at <a href="${APP_URL}/orders/${orderId}">${APP_URL}/orders/${orderId}</a> to view your page and request changes.</p>
        </div>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 14px;">— The Vexcraft Team</p>
      </div>
    `,
  });
}
