/**
 * Sonnet Coding Agent Spawning & Management
 * Spawns claude-sonnet subagents to build landing pages autonomously
 */

import { db } from "@/lib/db";

export interface CodeSessionContext {
  orderId: string;
  repoName: string;
  customerBrief: string;
  techStack?: Record<string, string> | null;
  previewUrl: string;
  githubRepo: string;
}

/**
 * Spawn a Sonnet coding agent to implement the landing page
 * Agent will:
 * - Clone repo locally
 * - Parse VEXCRAFT_BRIEF.md
 * - Implement components based on requirements
 * - Commit and push to GitHub
 * - Vercel auto-deploys on push
 */
export async function spawnLandingPageCodingAgent(
  context: CodeSessionContext
): Promise<{
  agentSessionId: string;
  error?: string;
}> {
  const {
    orderId,
    repoName,
    customerBrief,
    techStack,
    previewUrl,
    githubRepo,
  } = context;

  // Build the prompt for the Sonnet agent
  const prompt = buildCodingPrompt({
    orderId,
    repoName,
    customerBrief,
    techStack,
    previewUrl,
    githubRepo,
  });

  try {
    // Spawn agent via exec tool (background mode)
    // Agent ID will be returned and stored in database
    // The agent will run in isolated environment with timeout
    const agentSessionId = `agent-${orderId}-${Date.now()}`;

    // Log the spawning event
    await db.auditLog.create({
      data: {
        orderId,
        action: "AGENT_SPAWNED",
        actor: "system",
        actorEmail: "system@vexcraft.io",
        resourceType: "coding_agent",
        resourceId: agentSessionId,
        details: {
          agentModel: "claude-sonnet-4-6",
          timeout: "60m",
          prompt: prompt.substring(0, 200) + "...",
        },
        status: "PENDING",
      },
    });

    // Note: The actual spawning happens via exec tool in the setup route.
    // This function builds the context and validates prerequisites.
    // Return the session ID for tracking

    return { agentSessionId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await db.auditLog.create({
      data: {
        orderId,
        action: "AGENT_SPAWN_FAILED",
        actor: "system",
        resourceType: "coding_agent",
        details: { error: message },
        status: "FAILED",
        errorMessage: message,
      },
    });
    return { agentSessionId: "", error: message };
  }
}

interface BuildPromptOptions {
  orderId: string;
  repoName: string;
  customerBrief: string;
  techStack?: Record<string, string> | null;
  previewUrl: string;
  githubRepo: string;
}

function buildCodingPrompt(options: BuildPromptOptions): string {
  const {
    orderId,
    repoName,
    customerBrief,
    techStack,
    previewUrl,
    githubRepo,
  } = options;

  const techStackSection = techStack
    ? `
## Tech Stack
- Frontend: ${techStack.frontend || "Next.js (default)"}
- Backend: ${techStack.backend || "API Routes (default)"}
- Database: ${techStack.database || "PostgreSQL (default)"}
- Hosting: ${techStack.hosting || "Vercel (default)"}
`
    : "";

  return `You are a coding agent building a landing page for Vexcraft.

## Mission
Implement a professional, high-converting landing page based on the customer brief.

## Order Details
- Order ID: ${orderId}
- Repository: ${githubRepo}
- Live Preview: ${previewUrl}

## Customer Brief
${customerBrief}

${techStackSection}

## Requirements (CRITICAL - Must Complete All)

### 1. Setup
- Clone the repo locally
- Read VEXCRAFT_BRIEF.md thoroughly
- Understand the customer's requirements, style, and goals

### 2. Implementation
- Build React components that match the brief
- Implement responsive design (mobile-first)
- Add proper TypeScript types
- Follow Next.js 16 best practices
- Use Tailwind CSS for styling

### 3. Features to Implement
- Hero section with compelling headline
- Features/benefits section
- Call-to-action buttons
- Contact form (if requested in brief)
- Responsive navigation
- Mobile menu (hamburger)
- Footer with links

### 4. Quality Standards
- No TypeScript errors
- Accessibility: proper semantic HTML, ARIA labels
- Performance: optimize images, lazy loading
- Mobile: test on 375px, 768px, 1024px viewports
- Clean code: follow conventions, no console errors

### 5. Git Workflow (CRITICAL!)
After implementing changes:
1. \`git add -A\`
2. \`git commit -m "feat: implement landing page components"\`
3. **ALWAYS** run: \`git push origin main\`
4. Wait ~30s for Vercel deployment to start
5. Verify deployment at ${previewUrl}

**RULE: Push immediately after each feature is complete.**
Push = Deploy. No push = customer sees nothing.

### 6. Commit Pattern
Make logical, descriptive commits:
- \`git commit -m "feat: add hero section"\`
- \`git commit -m "feat: implement features grid"\`
- \`git commit -m "feat: add contact form"\`
- \`git commit -m "style: responsive mobile menu"\`

### 7. Stop Conditions
You're done when:
- All customer requirements from brief are implemented
- No TypeScript or build errors
- Code is committed and pushed to main
- Vercel deployment is green (no build errors)
- Latest commit is visible in GitHub repo

### 8. Error Handling
If you encounter errors:
- Check build logs
- Read error messages carefully
- Implement fixes
- Push again
- Verify Vercel deployment succeeds

## Final Output
When completely finished:
1. Verify git log shows your commits
2. Confirm Vercel shows green deployment
3. Test ${previewUrl} is live
4. Report success with commit SHAs

Begin implementation now. Focus on quality and completeness.`;
}

/**
 * Track agent progress and collect build logs
 */
export async function trackAgentProgress(
  orderId: string,
  agentSessionId: string,
  progress: {
    status: "STARTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    message: string;
    commits?: Array<{ sha: string; message: string }>;
    buildUrl?: string;
  }
): Promise<void> {
  await db.auditLog.create({
    data: {
      orderId,
      action: "AGENT_PROGRESS",
      actor: "system",
      resourceType: "coding_agent",
      resourceId: agentSessionId,
      details: progress,
      status: progress.status === "FAILED" ? "FAILED" : "PENDING",
    },
  });
}

/**
 * Get agent session status from audit logs
 */
export async function getAgentStatus(
  orderId: string
): Promise<{
  status: "IDLE" | "RUNNING" | "COMPLETED" | "FAILED";
  lastUpdate: string;
  commits: number;
}> {
  const logs = await db.auditLog.findMany({
    where: {
      orderId,
      action: { in: ["AGENT_SPAWNED", "AGENT_PROGRESS", "AGENT_SPAWN_FAILED"] },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  if (logs.length === 0) {
    return { status: "IDLE", lastUpdate: new Date().toISOString(), commits: 0 };
  }

  const latestLog = logs[0];
  const completedLogs = logs.filter((l) => l.action === "AGENT_PROGRESS" && (l.details as any)?.status === "COMPLETED");

  return {
    status: latestLog.action === "AGENT_SPAWN_FAILED" ? "FAILED" : latestLog.action === "AGENT_SPAWNED" ? "RUNNING" : "COMPLETED",
    lastUpdate: latestLog.createdAt.toISOString(),
    commits: completedLogs.length > 0 ? ((completedLogs[0].details as any)?.commits?.length ?? 0) : 0,
  };
}
