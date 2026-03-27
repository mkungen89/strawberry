/**
 * GitHub Issues Auto-Generation from Customer Brief
 * Parse requirements and create trackable issues
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_ORG = process.env.GITHUB_ORG || "vexcraft-io";

interface GitHubIssue {
  title: string;
  description: string;
  labels: string[];
  priority: "critical" | "high" | "medium" | "low";
}

/**
 * Parse customer brief and extract requirements
 * Returns structured issues ready for creation
 */
export function parseRequirementsFromBrief(brief: string): GitHubIssue[] {
  const issues: GitHubIssue[] = [];

  // Extract sections from brief
  const sections = brief.split(/\n#+\s+/);

  // Default issues based on brief content
  issues.push({
    title: "Design: Create hero section layout",
    description: `Create a compelling hero section based on customer brief:\n\n${brief.substring(0, 300)}`,
    labels: ["design", "content"],
    priority: "critical",
  });

  issues.push({
    title: "Feature: Add responsive navigation",
    description: "Implement responsive navigation with mobile hamburger menu",
    labels: ["feature", "frontend"],
    priority: "high",
  });

  issues.push({
    title: "Feature: Implement features/benefits section",
    description: "Create section showcasing product features and benefits",
    labels: ["feature", "content"],
    priority: "high",
  });

  issues.push({
    title: "Feature: Add call-to-action buttons",
    description: "Create compelling CTAs throughout the page",
    labels: ["feature", "content"],
    priority: "high",
  });

  issues.push({
    title: "Style: Optimize mobile responsiveness",
    description: "Ensure layout works perfectly on mobile, tablet, and desktop",
    labels: ["style", "frontend"],
    priority: "high",
  });

  issues.push({
    title: "Content: Add footer and contact information",
    description: "Create footer with links and contact details",
    labels: ["content"],
    priority: "medium",
  });

  // Check for specific mentions in brief
  if (brief.toLowerCase().includes("contact form")) {
    issues.push({
      title: "Feature: Implement contact form",
      description: "Add functional contact form with validation and submission",
      labels: ["feature", "frontend", "form"],
      priority: "high",
    });
  }

  if (brief.toLowerCase().includes("blog")) {
    issues.push({
      title: "Feature: Create blog section",
      description: "Setup blog layout with markdown support",
      labels: ["feature", "content"],
      priority: "medium",
    });
  }

  if (brief.toLowerCase().includes("gallery") || brief.toLowerCase().includes("portfolio")) {
    issues.push({
      title: "Feature: Add portfolio/gallery section",
      description: "Implement gallery with image optimization",
      labels: ["feature", "frontend"],
      priority: "medium",
    });
  }

  if (brief.toLowerCase().includes("testimonial") || brief.toLowerCase().includes("review")) {
    issues.push({
      title: "Content: Add testimonials section",
      description: "Create testimonials/reviews showcase",
      labels: ["content"],
      priority: "medium",
    });
  }

  // QA issue
  issues.push({
    title: "QA: Test and verify all pages",
    description: "Comprehensive testing of all landing page sections",
    labels: ["qa", "testing"],
    priority: "high",
  });

  return issues;
}

async function githubFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API error ${res.status} on ${path}: ${err}`);
  }

  return res.json();
}

export interface CreateIssueResult {
  number: number;
  title: string;
  htmlUrl: string;
  labels: string[];
}

/**
 * Create GitHub issues in repo from parsed requirements
 */
export async function createGitHubIssuesFromBrief(
  repoName: string,
  orderId: string,
  customerBrief: string
): Promise<CreateIssueResult[]> {
  const issues = parseRequirementsFromBrief(customerBrief);
  const created: CreateIssueResult[] = [];

  for (const issue of issues) {
    try {
      const result = await githubFetch(
        `/repos/${GITHUB_ORG}/${repoName}/issues`,
        {
          method: "POST",
          body: JSON.stringify({
            title: issue.title,
            body: issue.description + `\n\n---\n_Order ID: ${orderId}_`,
            labels: issue.labels,
          }),
        }
      );

      created.push({
        number: result.number,
        title: result.title,
        htmlUrl: result.html_url,
        labels: result.labels.map((l: any) => l.name),
      });

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.warn(`[GitHub Issues] Failed to create issue "${issue.title}":`, err);
      // Continue with other issues
    }
  }

  return created;
}

/**
 * Create a GitHub project (kanban board) for landing page
 */
export async function createGitHubProject(
  repoName: string,
  orderId: string
): Promise<{ projectId: number; projectUrl: string } | null> {
  try {
    // Create a project on the repo
    const project = await githubFetch(
      `/repos/${GITHUB_ORG}/${repoName}/projects`,
      {
        method: "POST",
        body: JSON.stringify({
          name: `Landing Page: ${orderId}`,
          body: `Development board for customer landing page order ${orderId}`,
          state: "open",
        }),
      }
    );

    return {
      projectId: project.id,
      projectUrl: project.html_url,
    };
  } catch (err) {
    console.warn("[GitHub Projects] Failed to create project:", err);
    return null;
  }
}

/**
 * Link issues to a GitHub project
 */
export async function linkIssuesToProject(
  repoName: string,
  projectId: number,
  issueNumbers: number[]
): Promise<void> {
  // Note: This uses the Projects API which has evolved.
  // For now, we'll log the project creation but linking requires more setup.
  // The project is created and visible, users can manually add issues or use automation.
  console.log(
    `[GitHub Projects] Issues can be added to project ${projectId} via GitHub UI or additional API calls`
  );
}
