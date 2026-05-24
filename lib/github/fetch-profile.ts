export type GitHubSummary = {
  username: string;
  name: string | null;
  bio: string | null;
  publicRepos: number;
  topLanguages: string[];
  repos: Array<{
    name: string;
    description: string | null;
    language: string | null;
    topics: string[];
    stars: number;
  }>;
  summaryText: string;
};

type GitHubUser = {
  login: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
};

type GitHubRepo = {
  name: string;
  description: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  updated_at: string;
};

function githubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "what-should-i-build",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

function buildSummaryText(
  user: GitHubUser,
  repos: GitHubRepo[],
  topLanguages: string[],
): string {
  const lines = [
    `User: ${user.login}${user.name ? ` (${user.name})` : ""}`,
    user.bio ? `Bio: ${user.bio}` : null,
    `Public repos: ${user.public_repos}`,
    topLanguages.length ? `Top languages: ${topLanguages.join(", ")}` : null,
    "Recent/top repos:",
  ].filter(Boolean) as string[];

  for (const repo of repos.slice(0, 6)) {
    const topics = repo.topics?.length ? ` [${repo.topics.join(", ")}]` : "";
    const desc = repo.description ? ` — ${repo.description}` : "";
    lines.push(
      `- ${repo.name} (${repo.language ?? "unknown"}, ${repo.stargazers_count}★)${desc}${topics}`,
    );
  }

  return lines.join("\n");
}

import { normalizeGitHubUsername } from "@/lib/schemas/form-input";

export async function fetchGitHubProfile(
  username: string,
): Promise<GitHubSummary | null> {
  const normalized = normalizeGitHubUsername(username);

  if (!normalized) {
    return null;
  }

  try {
    const userRes = await fetch(`https://api.github.com/users/${normalized}`, {
      headers: githubHeaders(),
      next: { revalidate: 3600 },
    });

    if (userRes.status === 404) {
      return null;
    }

    if (!userRes.ok) {
      throw new Error(`GitHub user fetch failed: ${userRes.status}`);
    }

    const user = (await userRes.json()) as GitHubUser;

    const reposRes = await fetch(
      `https://api.github.com/users/${normalized}/repos?sort=updated&per_page=10`,
      {
        headers: githubHeaders(),
        next: { revalidate: 3600 },
      },
    );

    if (!reposRes.ok) {
      throw new Error(`GitHub repos fetch failed: ${reposRes.status}`);
    }

    const repos = (await reposRes.json()) as GitHubRepo[];
    const sortedRepos = [...repos].sort(
      (a, b) => b.stargazers_count - a.stargazers_count,
    );

    const languageCounts = new Map<string, number>();
    for (const repo of sortedRepos) {
      if (repo.language) {
        languageCounts.set(
          repo.language,
          (languageCounts.get(repo.language) ?? 0) + 1,
        );
      }
    }

    const topLanguages = [...languageCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang);

    const summary: GitHubSummary = {
      username: user.login,
      name: user.name,
      bio: user.bio,
      publicRepos: user.public_repos,
      topLanguages,
      repos: sortedRepos.slice(0, 6).map((repo) => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        topics: repo.topics ?? [],
        stars: repo.stargazers_count,
      })),
      summaryText: buildSummaryText(user, sortedRepos, topLanguages),
    };

    return summary;
  } catch {
    return null;
  }
}
