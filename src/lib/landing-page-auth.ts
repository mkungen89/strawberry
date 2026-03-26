import { createHash, timingSafeEqual, randomBytes, createHmac } from "crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export function generateAccessToken(): string {
  return `lpat_${randomBytes(32).toString("hex")}`;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function validateAccessToken(
  orderId: string,
  token: string
): Promise<{
  valid: boolean;
  orderId?: string;
}> {
  try {
    const hash = hashToken(token);
    const access = await db.landingPageAccess.findFirst({
      where: { accessTokenHash: hash, orderId },
    });

    if (!access) return { valid: false };

    // Constant-time comparison to prevent timing attacks
    const storedHash = Buffer.from(access.accessTokenHash, "hex");
    const givenHash = Buffer.from(hash, "hex");
    if (storedHash.length !== givenHash.length) return { valid: false };
    if (!timingSafeEqual(storedHash, givenHash)) return { valid: false };

    return { valid: true, orderId: access.orderId };
  } catch {
    return { valid: false };
  }
}

export function validateVercelWebhook(signature: string, body: string): boolean {
  const secret = process.env.VERCEL_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[Security] VERCEL_WEBHOOK_SECRET not set — skipping validation");
    return true;
  }

  try {
    const expected = createHmac("sha1", secret).update(body).digest("hex");
    const expectedBuf = Buffer.from(`sha1=${expected}`);
    const receivedBuf = Buffer.from(signature);
    if (expectedBuf.length !== receivedBuf.length) return false;
    return timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    return false;
  }
}

export function validateGitHubWebhook(signature: string, body: string): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[Security] GITHUB_WEBHOOK_SECRET not set — skipping validation");
    return true;
  }

  try {
    const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
    const expectedBuf = Buffer.from(expected);
    const receivedBuf = Buffer.from(signature);
    if (expectedBuf.length !== receivedBuf.length) return false;
    return timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    return false;
  }
}

export async function logAuditEvent(
  orderId: string,
  action: string,
  actor: string,
  details: Prisma.InputJsonObject,
  options: {
    actorEmail?: string;
    resourceType?: string;
    resourceId?: string;
    status?: string;
    errorMessage?: string;
    req?: Request;
  } = {}
): Promise<void> {
  try {
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    if (options.req) {
      ipAddress =
        options.req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        options.req.headers.get("x-real-ip") ??
        undefined;
      userAgent = options.req.headers.get("user-agent") ?? undefined;
    }

    await db.auditLog.create({
      data: {
        orderId,
        action,
        actor,
        actorEmail: options.actorEmail,
        resourceType: options.resourceType,
        resourceId: options.resourceId,
        details,
        ipAddress,
        userAgent,
        status: options.status ?? "SUCCESS",
        errorMessage: options.errorMessage,
      },
    });
  } catch (e) {
    // Audit logging must never crash the caller
    console.error("[AuditLog] Failed to log event:", e);
  }
}
