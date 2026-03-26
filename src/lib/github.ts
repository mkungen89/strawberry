const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_ORG = process.env.GITHUB_ORG || "vexcraft-io";
const TEMPLATE_REPO = "vexcraft-landing-page-template";

export interface GitCommit {
  sha: string;
  message: string;
  author: string;
  timestamp: string;
  filesChanged: string[];
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

  if (res.status === 204) return null;
  return res.json();
}

export async function createLandingPageRepo(
  orderId: string,
  customerName: string
): Promise<{ repoUrl: string; cloneUrl: string; repoName: string }> {
  const repoName = `landing-page-${orderId}`;

  // Create repo from template
  await githubFetch(`/repos/${GITHUB_ORG}/${TEMPLATE_REPO}/generate`, {
    method: "POST",
    body: JSON.stringify({
      owner: GITHUB_ORG,
      name: repoName,
      description: `Landing page for ${orderId} — ${customerName}`,
      private: true,
      include_all_branches: false,
    }),
  });

  // Wait briefly for repo to be ready
  await new Promise((r) => setTimeout(r, 2000));

  // Set topics
  await githubFetch(`/repos/${GITHUB_ORG}/${repoName}/topics`, {
    method: "PUT",
    body: JSON.stringify({ names: ["vexcraft", "landing-page", "generated"] }),
  }).catch(() => {}); // Non-critical

  return {
    repoName,
    repoUrl: `https://github.com/${GITHUB_ORG}/${repoName}`,
    cloneUrl: `https://github.com/${GITHUB_ORG}/${repoName}.git`,
  };
}

export async function getGitHubFileChanges(
  repo: string,
  since: Date
): Promise<GitCommit[]> {
  const commits: Array<{
    sha: string;
    commit: { message: string; author: { name: string; date: string } };
  }> = await githubFetch(
    `/repos/${GITHUB_ORG}/${repo}/commits?since=${since.toISOString()}&per_page=50`
  );

  const result: GitCommit[] = [];

  for (const c of commits.slice(0, 10)) {
    const detail: { files?: Array<{ filename: string }> } = await githubFetch(
      `/repos/${GITHUB_ORG}/${repo}/commits/${c.sha}`
    ).catch(() => ({ files: [] }));

    result.push({
      sha: c.sha.slice(0, 7),
      message: c.commit.message,
      author: c.commit.author.name,
      timestamp: c.commit.author.date,
      filesChanged: (detail.files ?? []).map((f) => f.filename),
    });
  }

  return result;
}
