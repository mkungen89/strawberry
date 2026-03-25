/**
 * Additional email templates for Vexcraft
 */

export function reviewReminderEmail(
  customerName: string,
  serviceName: string,
  orderId: string
) {
  return {
    subject: `How was your experience? Leave a review | Vexcraft`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e5e5; padding: 40px 30px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #a855f6; margin: 0;">⚡ Vexcraft</h1>
        </div>
        <h2 style="color: white; margin-bottom: 10px;">How Did We Do?</h2>
        <p>Hi ${customerName},</p>
        <p>We hope you're happy with your <strong>${serviceName}</strong> project! 🎉</p>
        <p>Your feedback helps us improve and helps others discover Vexcraft. Would you mind leaving a quick review?</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://vexcraft.io/orders/${orderId}#review" style="display: inline-block; background: #a855f6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Leave a Review ⭐
          </a>
        </div>
        <p style="font-size: 14px; color: #888; margin-top: 30px;">It only takes a minute and means the world to us!</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">— The Vexcraft Team</p>
      </div>
    `,
  };
}

export function orderInQueueEmail(
  customerName: string,
  serviceName: string,
  orderId: string
) {
  return {
    subject: `Your order is in queue — ${serviceName} | Vexcraft`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e5e5; padding: 40px 30px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #a855f6; margin: 0;">⚡ Vexcraft</h1>
        </div>
        <h2 style="color: white; margin-bottom: 10px;">Order Received!</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for choosing Vexcraft! 🎉</p>
        <p>Your order for <strong>${serviceName}</strong> is now in our queue. We'll review your project brief and start work as soon as possible.</p>
        <div style="background: #1a1a2e; border: 1px solid #2a2a4a; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong style="color: #a855f6;">Service:</strong> ${serviceName}</p>
          <p style="margin: 0;"><strong style="color: #a855f6;">Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
        </div>
        <p>You'll receive another email when we start working on your project.</p>
        <p><a href="https://vexcraft.io/orders/${orderId}" style="color: #a855f6;">Track your order →</a></p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">— The Vexcraft Team</p>
      </div>
    `,
  };
}
