/**
 * Sonnet Coding Agent Spawning & Management
 * Spawns claude-sonnet subagents to build landing pages autonomously
 * using Claude Code CLI as a detached background process.
 */

import { spawn } from "child_process";
import { mkdirSync, writeFileSync, openSync, closeSync } from "fs";
import { join } from "path";
import { db } from "@/lib/db";

export interface CodeSessionContext {
  orderId: string;
  repoName: string;
  customerBrief: string;
  techStack?: Record<string, string> | null;
  previewUrl: string;
  githubRepo: string;
  vercelProjectId?: string;
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

    // Git identity — use GitHub noreply email so Vercel can associate commits with the account
    const githubUserId = process.env.GITHUB_USER_ID || "127892048";
    const githubLogin = process.env.GITHUB_LOGIN || "mkungen89";
    const gitConfig = [
      "[user]",
      "  name = Vexcraft Agent",
      `  email = ${githubUserId}+${githubLogin}@users.noreply.github.com`,
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

    const prompt = buildCodingPrompt({ orderId, repoName, customerBrief, techStack, previewUrl, githubRepo, vercelProjectId: context.vercelProjectId });
    const logPath = join(workDir, "agent.log");

    // openSync gives a real fd that spawn can pass to the child process
    const logFd = openSync(logPath, "a");

    const env: NodeJS.ProcessEnv = {
      ...process.env,
      HOME: workDir,
      GIT_CONFIG_NOSYSTEM: "1",
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
      VERCEL_API_TOKEN: process.env.VERCEL_API_TOKEN ?? "",
      VERCEL_TEAM_ID: process.env.VERCEL_TEAM_ID ?? "",
      VERCEL_PROJECT_ID: context.vercelProjectId ?? "",
    };

    const scriptPath = join(process.cwd(), "src/scripts/run-coding-agent.ts");

    const agentProcess = spawn(
      "npx",
      [
        "ts-node",
        "--project", "tsconfig.scripts.json",
        "--transpile-only",
        scriptPath,
        orderId,
        repoName,
        githubRepo,
        previewUrl,
        context.vercelProjectId ?? "",
      ],
      {
        cwd: process.cwd(), // Next.js root — where tsconfig lives
        detached: true,
        stdio: ["ignore", logFd, logFd],
        env: {
          ...env,
          AGENT_BRIEF: customerBrief,
          AGENT_TECH_STACK: JSON.stringify(techStack ?? {}),
          AGENT_WORKDIR: workDir,
        },
      }
    );

    // Close parent's copy of the fd — child has its own
    closeSync(logFd);

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
  vercelProjectId?: string;
}

function buildCodingPrompt(options: BuildPromptOptions): string {
  const { orderId, repoName, customerBrief, techStack, previewUrl, githubRepo, vercelProjectId } = options;

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

  const teamParam = process.env.VERCEL_TEAM_ID ? `&teamId=${process.env.VERCEL_TEAM_ID}` : "";

  const vercelPollingScript = vercelProjectId
    ? `
### After every \`git push\`: verify Vercel deployment
Run this script after each push to check if Vercel built successfully.
If it fails, read the error logs and fix the code before pushing again.

\`\`\`bash
echo "⏳ Waiting for Vercel deployment..."
sleep 15

for i in $(seq 1 24); do
  RESPONSE=$(curl -sf "https://api.vercel.com/v6/deployments?projectId=${vercelProjectId}&limit=1${teamParam}" \\
    -H "Authorization: Bearer $VERCEL_API_TOKEN" 2>/dev/null)
  STATE=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['deployments'][0]['state'])" 2>/dev/null)
  DEPLOY_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['deployments'][0]['uid'])" 2>/dev/null)

  if [ "$STATE" = "READY" ]; then
    echo "✅ Vercel deployment READY — ${previewUrl}"
    break
  elif [ "$STATE" = "ERROR" ]; then
    echo "❌ Vercel deployment FAILED — fetching build logs..."
    curl -sf "https://api.vercel.com/v2/deployments/$DEPLOY_ID/events?limit=200${teamParam}" \\
      -H "Authorization: Bearer $VERCEL_API_TOKEN" | \\
      python3 -c "
import sys, json
events = json.load(sys.stdin).get('events', [])
for e in events:
    t = e.get('type','')
    text = e.get('payload', {}).get('text', '')
    if t in ('stderr', 'stdout') and text.strip():
        print(text)
"
    echo "--- End of Vercel logs ---"
    echo "Fix the errors above, then commit and push again."
    break
  else
    echo "⏳ Still building... state=$STATE ($i/24)"
    sleep 10
  fi
done
\`\`\`

**RULE: Never consider a feature done until this script shows ✅ READY.**
If it shows ❌ FAILED, read the logs carefully, fix the issue, push again, and re-run the check.
`
    : `
### After every \`git push\`
Wait ~30s then check ${previewUrl} to verify the deployment succeeded.
`;

  return `You are a senior fullstack developer. Your job is to build a complete, professional landing page for a Vexcraft customer.

## Order
- Order ID: ${orderId}
- Repo: ${githubRepo}
- Preview: ${previewUrl}

## Customer Brief
${customerBrief}
${techSection}

## Step-by-step Instructions

### 1. Clone and scaffold
\`\`\`bash
git clone ${cloneUrl} ${repoName}
cd ${repoName}

# Scaffold Next.js into the existing repo directory
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git --yes

# Install dependencies
npm install
\`\`\`

### 2. Read the brief
Read VEXCRAFT_BRIEF.md — it contains everything the customer wants.
The brief was pushed to the repo root before you cloned it.

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

${vercelPollingScript}

### 6. Done when
- All brief requirements are implemented
- \`npm run build\` passes with no errors
- All changes are pushed to main
- Vercel shows ✅ READY for the latest deployment

Start now. Work systematically through each section. After every push, always run the Vercel check script and fix any errors before continuing.`;
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
