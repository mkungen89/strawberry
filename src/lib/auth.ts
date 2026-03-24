import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import { db } from "./db";
import { sendEmail } from "./email";

// Build social providers only if credentials exist
const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || (() => { throw new Error("BETTER_AUTH_SECRET env variable is required"); })(),
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password | Vexcraft",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e5e5; padding: 40px 30px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #a855f6; margin: 0;">⚡ Vexcraft</h1>
            </div>
            <h2 style="color: white;">Reset Your Password</h2>
            <p>Hi ${user.name},</p>
            <p>We received a request to reset your password. Click the button below to choose a new one.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${url}" style="display: inline-block; background: #a855f6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
            </p>
            <p style="color: #888; font-size: 12px;">If you didn't request this, you can safely ignore this email. The link expires in 1 hour.</p>
            <p style="color: #888; font-size: 12px; margin-top: 20px;">— The Vexcraft Team</p>
          </div>
        `,
      });
    },
  },
  socialProviders,
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "https://vexcraft.io",
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        input: false,
      },
    },
  },
  plugins: [
    twoFactor({
      issuer: "Vexcraft",
      totpOptions: {
        period: 30,
        digits: 6,
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
