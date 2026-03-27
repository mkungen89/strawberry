/**
 * Sonnet Coding Agent Spawning & Management
 * Spawns claude-sonnet subagents to build landing pages autonomously
 * using Claude Code CLI as a detached background process.
 */

import { spawn } from "child_process";
import { mkdirSync, writeFileSync, createWriteStream } from "fs";
import { join } from "path";
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
 * Spawn a Sonnet coding agent to implement the landing page.
 * Runs `claude --dangerously-skip-permissions -p "..."` as a detached
 * child process. The agent clones the repo, builds the page, commits
 * and pushes — Vercel auto-deploys on every push.
 */
export async function spawnLandingPageCodingAgent(
  context: CodeSessionContext
): Promise<{ agentSessionId: string; error?: string }> {
  const { orderId, repoName, customerBrief, techStack, previewUrl, githubRepo } = context;

  const agentSessionId = `agent-${orderId}-${Date.now()}`;
  const workDir = `/tmp/agents/${agentSessionId}`;

  try {
    // Create isolated working directory
    mkdirSync(workDir, { recursive: true });

    // Git identity & credential store
    const gitConfig = [
      "[user]",
      "  name = Vexcraft Agent",
      "  email = agent@vexcraft.io",
      "[credential]",
      "  helper = store",
      "[init]",
      "  defaultBranch = main",
    ].join("\n");
    writeFileSync(join(workDir, ".gitconfig"), gitConfig, { mode: 0o600 });

    if (process.env.GITHUB_TOKEN) {
      writeFileSync(
        join(workDir, ".git-credentials"),
        `https://x-access-token:${process.env.GITHUB_TOKEN}@github.com\n`,
        { mode: 0o600 }
      );
    }

    const prompt = buildCodingPrompt({ orderId, repoName, customerBrief, techStack, previewUrl, githubRepo });
    const logPath = join(workDir, "agent.log");
    const logStream = createWriteStream(logPath, { flags: "a" });

    const env: NodeJS.ProcessEnv = {
      ...process.env,
      HOME: workDir,
      GIT_CONFIG_NOSYSTEM: "1",
      // Ensure ANTHROPIC_API_KEY is forwarded
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
    };

    const agentProcess = spawn(
      "claude",
      [
        "--dangerously-skip-permissions",
        "--model", "claude-sonnet-4-6",
        "--bare",
        "-p", prompt,
      ],
      {
        cwd: workDir,
        detached: true,
        stdio: ["ignore", logStream, logStream],
        env,
      }
    );

    // Detach so the process outlives the HTTP request
    agentProcess.unref();

    const pid = agentProcess.pid ?? null;

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
          pid,
          workDir,
          logPath,
          githubRepo,
          promptPreview: prompt.substring(0, 300) + "…",
        },
        status: "PENDING",
      },
    });

    console.log(`[Agent] Spawned PID ${pid} → ${logPath}`);
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
  const { orderId, repoName, customerBrief, techStack, previewUrl, githubRepo } = options;

  const techSection = techStack
    ? `
## Tech Stack
- Frontend: ${techStack.frontend || "Next.js"}
- Backend: ${techStack.backend || "API Routes"}
- Database: ${techStack.database || "PostgreSQL"}
- Hosting: ${techStack.hosting || "Vercel"}
`
    : "";

  const cloneUrl = `https://github.com/${githubRepo}.git`;

  return `You are a senior fullstack developer. Your job is to build a complete, professional landing page for a Vexcraft customer.

## Order
- Order ID: ${orderId}
- Repo: ${githubRepo}
- Preview: ${previewUrl}

## Customer Brief
${customerBrief}
${techSection}

## Step-by-step Instructions

### 1. Clone the repository
\`\`\`bash
git clone ${cloneUrl} ${repoName}
cd ${repoName}
\`\`\`

### 2. Read the brief
Read VEXCRAFT_BRIEF.md — it contains everything the customer wants.

### 3. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 4. Build the landing page
Implement all sections from the brief:
- Hero with compelling headline and CTA
- Features / benefits section
- Social proof / testimonials (if requested)
- Contact form (if requested)
- Responsive navigation + mobile hamburger menu
- Footer

Standards:
- Next.js 14+ App Router, TypeScript, Tailwind CSS
- Mobile-first responsive (375px, 768px, 1024px+)
- Proper semantic HTML and ARIA labels
- No TypeScript errors: run \`npm run build\` to verify
- No console errors or warnings

### 5. Commit and push after each feature
\`\`\`bash
git add -A
git commit -m "feat: <feature name>"
git push origin main
\`\`\`
**Push = Deploy. Every push triggers Vercel. Push often.**

### 6. Done when
- All brief requirements are implemented
- \`npm run build\` passes with no errors
- All changes are pushed to main
- Vercel shows a successful deployment at ${previewUrl}

Start now. Work systematically through each section. Push after every meaningful feature.`;
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
export async function getAgentStatus(orderId: string): Promise<{
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

  const latest = logs[0];
  const completedLogs = logs.filter(
    (l) => l.action === "AGENT_PROGRESS" && (l.details as Record<string, unknown>)?.status === "COMPLETED"
  );

  let status: "IDLE" | "RUNNING" | "COMPLETED" | "FAILED" = "RUNNING";
  if (latest.action === "AGENT_SPAWN_FAILED") status = "FAILED";
  else if (completedLogs.length > 0) status = "COMPLETED";

  return {
    status,
    lastUpdate: latest.createdAt.toISOString(),
    commits: completedLogs.length > 0
      ? ((completedLogs[0].details as Record<string, unknown>)?.commits as unknown[] | undefined)?.length ?? 0
      : 0,
  };
}
