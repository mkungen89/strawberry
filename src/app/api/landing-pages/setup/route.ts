import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createLandingPageRepo, pushBriefFile } from "@/lib/github";
import { createVercelProject } from "@/lib/vercel";
import { generateAccessToken, hashToken, logAuditEvent } from "@/lib/landing-page-auth";
import { notifyRepoCreated } from "@/lib/landing-page-discord";
import { sendPreviewReadyEmail } from "@/lib/landing-page-emails";

// Internal endpoint — only callable from within Vexcraft (Stripe webhook, admin)
function isInternalRequest(req: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return true; // Allow if not configured (dev mode)
  return req.headers.get("x-internal-secret") === secret;
}

export async function POST(req: NextRequest) {
  if (!isInternalRequest(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { orderId, customerName, customerEmail } = body as {
    orderId: string;
    customerName: string;
    customerEmail: string;
  };

  if (!orderId || !customerName || !customerEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Idempotency — don't create twice
  const existing = await db.landingPageAccess.findUnique({ where: { orderId } });
  if (existing) {
    return NextResponse.json({
      success: true,
      githubRepo: existing.githubRepo,
      vercelUrl: existing.vercelUrl,
      accessToken: null, // Token was already sent — don't re-expose
      previewUrl: existing.vercelUrl,
    });
  }

  // Fetch order to get customer brief + tech stack
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { details: true, techStack: true },
  });

  const customerBrief =
    (order?.details as Record<string, string> | null)?.description ?? "";
  const techStack = order?.techStack as Record<string, string> | null;

  try {
    // 1. Create GitHub repo from template
    const { repoName, repoUrl } = await createLandingPageRepo(orderId, customerName);

    // 2. Push brief + tech stack to repo as VEXCRAFT_BRIEF.md
    await pushBriefFile(repoName, orderId, customerName, customerBrief, techStack).catch((e) =>
      console.warn("[LandingPage] Could not push brief file:", e.message)
    );

    // 3. Create Vercel project linked to repo
    const { projectId, previewUrl } = await createVercelProject(orderId, repoName);

    // 3. Generate access token
    const accessToken = generateAccessToken();
    const accessTokenHash = hashToken(accessToken);

    // 4. Persist LandingPageAccess
    await db.landingPageAccess.create({
      data: {
        orderId,
        accessToken,
        accessTokenHash,
        githubRepo: `${process.env.GITHUB_ORG || "vexcraft-io"}/${repoName}`,
        vercelProjectId: projectId,
        vercelUrl: previewUrl,
      },
    });

    // 5. Audit log
    await logAuditEvent(orderId, "REPO_CREATED", "system", {
      githubRepo: repoName,
      vercelProjectId: projectId,
      previewUrl,
    }, { resourceType: "github_repo", resourceId: repoName });

    // 6. Discord + email (fire-and-forget)
    notifyRepoCreated(orderId, repoUrl, previewUrl, techStack).catch(() => {});
    sendPreviewReadyEmail(customerEmail, customerName, orderId, previewUrl).catch(() => {});

    return NextResponse.json({
      success: true,
      githubRepo: `${process.env.GITHUB_ORG || "vexcraft-io"}/${repoName}`,
      vercelUrl: previewUrl,
      accessToken,
      previewUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await logAuditEvent(orderId, "REPO_CREATED", "system", { error: message }, {
      status: "FAILED",
      errorMessage: message,
    });
    console.error("[LandingPage] Setup failed:", message);
    return NextResponse.json({ error: "Setup failed", details: message }, { status: 500 });
  }
}
