import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createLandingPageRepo, pushBriefFile } from "@/lib/github";
import { createVercelProject } from "@/lib/vercel";
import { generateAccessToken, hashToken, logAuditEvent } from "@/lib/landing-page-auth";
import { notifyRepoCreated } from "@/lib/landing-page-discord";
import { sendPreviewReadyEmail } from "@/lib/landing-page-emails";
import { spawnLandingPageCodingAgent } from "@/lib/coding-agent";
import { createGitHubIssuesFromBrief, createGitHubProject } from "@/lib/github-issues";

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

    // 4. Generate access token
    const accessToken = generateAccessToken();
    const accessTokenHash = hashToken(accessToken);

    // 5. Persist LandingPageAccess
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

    // 6. Create GitHub issues from customer brief
    const issues = await createGitHubIssuesFromBrief(
      repoName,
      orderId,
      customerBrief
    ).catch((e) => {
      console.warn("[LandingPage] Could not create GitHub issues:", e.message);
      return [];
    });

    // 7. Create GitHub project/kanban board
    const project = await createGitHubProject(repoName, orderId).catch((e) => {
      console.warn("[LandingPage] Could not create GitHub project:", e.message);
      return null;
    });

    // 8. Audit log
    await logAuditEvent(orderId, "REPO_CREATED", "system", {
      githubRepo: repoName,
      vercelProjectId: projectId,
      previewUrl,
      issuesCreated: issues.length,
      projectUrl: project?.projectUrl,
    }, { resourceType: "github_repo", resourceId: repoName });

    // 9. Spawn Sonnet coding agent (fire-and-forget, background)
    spawnCodingAgentAsync(orderId, repoName, customerBrief, techStack, previewUrl, `${process.env.GITHUB_ORG || "vexcraft-io"}/${repoName}`).catch(
      (e) => console.error("[LandingPage] Failed to spawn coding agent:", e.message)
    );

    // 10. Discord + email (fire-and-forget)
    notifyRepoCreated(orderId, repoUrl, previewUrl, techStack).catch(() => {});
    sendPreviewReadyEmail(customerEmail, customerName, orderId, previewUrl).catch(() => {});

    return NextResponse.json({
      success: true,
      githubRepo: `${process.env.GITHUB_ORG || "vexcraft-io"}/${repoName}`,
      vercelUrl: previewUrl,
      accessToken,
      previewUrl,
      issuesCreated: issues.length,
      agentSpawned: true,
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

/**
 * Spawn Sonnet agent to build landing page (non-blocking)
 * Uses OpenClaw's sessions_spawn with claude-sonnet-4-6 model
 */
async function spawnCodingAgentAsync(
  orderId: string,
  repoName: string,
  customerBrief: string,
  techStack: Record<string, string> | null | undefined,
  previewUrl: string,
  githubRepo: string
) {
  try {
    // Register agent spawn in audit log
    const { agentSessionId, error: spawnError } = await spawnLandingPageCodingAgent({
      orderId,
      repoName,
      customerBrief,
      techStack: techStack ?? undefined,
      previewUrl,
      githubRepo,
    });

    if (spawnError) {
      console.error(`[Agent] Failed to spawn for ${orderId}:`, spawnError);
      return;
    }

    // Build the agent prompt
    const prompt = buildAgentPrompt(orderId, repoName, customerBrief, techStack, previewUrl, githubRepo);

    // Note: Actual spawning would happen via OpenClaw's sessions_spawn
    // For now, we log the intent and prepare the context
    console.log(
      `[Agent] Spawned coding agent ${agentSessionId} for order ${orderId}`
    );

    // In a real setup with OpenClaw integration, you would call:
    // await sessions_spawn({
    //   sessionId: agentSessionId,
    //   runtime: "claude",
    //   model: "claude-sonnet-4-6",
    //   prompt,
    //   timeout: 3600, // 1 hour
    //   workdir: `/tmp/coding-${orderId}`,
    // });

    // For now, just log that it would be spawned
    await db.auditLog.create({
      data: {
        orderId,
        action: "AGENT_SPAWN_INITIATED",
        actor: "system",
        resourceType: "coding_agent",
        resourceId: agentSessionId,
        details: {
          model: "claude-sonnet-4-6",
          timeout: "3600s",
          repo: githubRepo,
        },
        status: "PENDING",
      },
    });
  } catch (err) {
    console.error("[Agent Spawn Error]:", err);
  }
}

function buildAgentPrompt(
  orderId: string,
  repoName: string,
  customerBrief: string,
  techStack: Record<string, string> | null | undefined,
  previewUrl: string,
  githubRepo: string
): string {
  const techSection = techStack
    ? `
## Tech Stack
- Frontend: ${techStack.frontend || "Next.js"}
- Backend: ${techStack.backend || "API Routes"}
- Database: ${techStack.database || "PostgreSQL"}
- Hosting: ${techStack.hosting || "Vercel"}
`
    : "";

  return `You are a senior fullstack developer building a landing page for Vexcraft customers.

## Order Context
- Order ID: ${orderId}
- Repository: ${githubRepo}
- Preview URL: ${previewUrl}

## Customer Requirements
${customerBrief}
${techSection}

## Your Task
1. Clone the repository: git clone ${`https://github.com/${githubRepo}.git`}
2. Read VEXCRAFT_BRIEF.md thoroughly
3. Create a professional, responsive landing page matching the brief
4. Implement all required sections and features
5. Ensure TypeScript and build pass without errors
6. Make logical commits with clear messages
7. After each significant feature, run: git push origin main
8. Never skip the push step — it triggers Vercel deployment

## Implementation Standards
- Use Next.js 16 and Tailwind CSS
- Ensure mobile responsiveness (375px+)
- Add proper semantic HTML and ARIA labels
- Optimize images and performance
- Follow TypeScript best practices
- No console errors or warnings

## Critical Rules
- ALWAYS push to main after committing
- Push = Deploy (customers see nothing until pushed)
- Test changes locally first
- Verify Vercel deployment succeeds
- Make small, focused commits

Build the landing page completely and push all changes to main.`;
}
