#!/usr/bin/env npx ts-node --project tsconfig.scripts.json
/**
 * Standalone coding agent — runs via Anthropic SDK with Bash tool.
 * Usage: ts-node run-coding-agent.ts <orderId> <repoName> <githubRepo> <previewUrl> <vercelProjectId>
 *
 * Reads customer brief from AGENT_BRIEF env var.
 * All output goes to stdout (redirect to log file from caller).
 */

import Anthropic from "@anthropic-ai/sdk";
import { execSync, exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const [, , orderId, repoName, githubRepo, previewUrl, vercelProjectId] = process.argv;
const customerBrief = process.env.AGENT_BRIEF ?? "";
const techStackRaw = process.env.AGENT_TECH_STACK ?? "{}";
let techStack: Record<string, string> = {};
try { techStack = JSON.parse(techStackRaw); } catch {}

const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN ?? "";
const VERCEL_TEAM = process.env.VERCEL_TEAM_ID ?? "";
const teamParam = VERCEL_TEAM ? `&teamId=${VERCEL_TEAM}` : "";

// AGENT_WORKDIR is the isolated temp dir with .gitconfig + .git-credentials
const AGENT_WORKDIR = process.env.AGENT_WORKDIR ?? `/tmp/agents/${orderId}-${Date.now()}`;
const WORKDIR = AGENT_WORKDIR;

function log(msg: string) {
  process.stdout.write(`[${new Date().toISOString()}] ${msg}\n`);
}

const techSection = Object.keys(techStack).length
  ? Object.entries(techStack).map(([k, v]) => `- ${k}: ${v}`).join("\n")
  : "- Frontend: Next.js\n- Hosting: Vercel";

// GitHub noreply email — required so Vercel can associate commits with the GitHub account
const githubUserId = process.env.GITHUB_USER_ID || "127892048";
const githubLogin = process.env.GITHUB_LOGIN || "mkungen89";
const GIT_EMAIL = `${githubUserId}+${githubLogin}@users.noreply.github.com`;

const SYSTEM_PROMPT = `You are a senior fullstack developer building a landing page for Vexcraft.
You have access to a Bash tool. Use it to run shell commands.
Work directory: ${WORKDIR}
GitHub repo: ${githubRepo}
Preview URL: ${previewUrl}

Rules:
- Always run commands with Bash tool
- After each git push, poll Vercel to check deployment status
- Fix any build errors before moving on
- Be concise in your thoughts, focus on action`;

const USER_PROMPT = `Build a professional landing page for this customer.

## Customer Brief
${customerBrief}

## Tech Stack
${techSection}

## Steps

1. Clone repo:
   git clone https://github.com/${githubRepo}.git ${repoName}
   cd ${repoName}
   git config user.email "${GIT_EMAIL}"
   git config user.name "Vexcraft Agent"

2. Scaffold Next.js:
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git --yes

3. Read VEXCRAFT_BRIEF.md for full requirements

4. Build all sections from the brief. At minimum:
   - Hero with animated/gradient background
   - Features grid
   - Testimonials
   - Pricing table (if requested)
   - Contact form (if requested)
   - CTA section
   - Responsive navbar + mobile menu
   - Footer

5. After each feature: git add -A && git commit -m "feat: ..." && git push origin main

6. After each push, verify Vercel deployment:
   sleep 15
   for i in $(seq 1 24); do
     RESP=$(curl -sf "https://api.vercel.com/v6/deployments?projectId=${vercelProjectId}&limit=1${teamParam}" -H "Authorization: Bearer ${VERCEL_TOKEN}")
     STATE=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['deployments'][0]['state'])" 2>/dev/null)
     DID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['deployments'][0]['uid'])" 2>/dev/null)
     if [ "$STATE" = "READY" ]; then echo "✅ Vercel READY"; break
     elif [ "$STATE" = "ERROR" ]; then
       echo "❌ Vercel FAILED - fetching logs"
       curl -sf "https://api.vercel.com/v2/deployments/$DID/events?limit=200${teamParam}" -H "Authorization: Bearer ${VERCEL_TOKEN}" | python3 -c "import sys,json;[print(e['payload']['text']) for e in json.load(sys.stdin).get('events',[]) if e.get('type') in ('stderr','stdout') and e.get('payload',{}).get('text','').strip()]"
       break
     else echo "⏳ Building $i/24"; sleep 10; fi
   done

Done when: npm run build passes, all sections implemented, latest Vercel deployment is READY.`;

async function runBash(command: string): Promise<{ stdout: string; stderr: string; error?: string }> {
  log(`$ ${command.slice(0, 120)}${command.length > 120 ? "…" : ""}`);
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: WORKDIR,
      timeout: 300_000,
      maxBuffer: 10 * 1024 * 1024,
      env: {
        ...process.env,
        HOME: WORKDIR,               // Use agent workdir for .gitconfig + .git-credentials
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_TERMINAL_PROMPT: "0",    // Never prompt for credentials
      },
    });
    if (stdout) log(`stdout: ${stdout.slice(0, 500)}`);
    if (stderr) log(`stderr: ${stderr.slice(0, 200)}`);
    return { stdout, stderr };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    const msg = e.message ?? "command failed";
    log(`error: ${msg.slice(0, 300)}`);
    return { stdout: e.stdout ?? "", stderr: e.stderr ?? "", error: msg };
  }
}

async function main() {
  log(`Starting coding agent for order ${orderId}`);
  log(`Repo: ${githubRepo} | Preview: ${previewUrl}`);

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: USER_PROMPT },
  ];

  let iterations = 0;
  const MAX_ITERATIONS = 50;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    log(`--- Iteration ${iterations} ---`);

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8096,
      system: SYSTEM_PROMPT,
      tools: [
        {
          name: "Bash",
          description: "Run a bash command. Returns stdout and stderr.",
          input_schema: {
            type: "object" as const,
            properties: {
              command: { type: "string", description: "The bash command to run" },
            },
            required: ["command"],
          },
        },
      ],
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const text = response.content.find((b) => b.type === "text");
      log(`Agent finished: ${text?.text?.slice(0, 200) ?? "(no text)"}`);
      break;
    }

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== "tool_use") continue;

        if (block.name === "Bash") {
          const input = block.input as { command: string };
          const result = await runBash(input.command);
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: [
              {
                type: "text",
                text: `stdout:\n${result.stdout}\nstderr:\n${result.stderr}${result.error ? `\nerror: ${result.error}` : ""}`,
              },
            ],
          });
        }
      }

      messages.push({ role: "user", content: toolResults });
    }
  }

  if (iterations >= MAX_ITERATIONS) {
    log("Max iterations reached.");
  }
  log("Agent done.");
}

main().catch((err) => {
  log(`Fatal error: ${err.message}`);
  process.exit(1);
});
