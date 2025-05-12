import type { Tags, LatestRelease, Commits, CheckRuns } from './github-types';

const GITHUB_API_BASE = 'https://api.github.com/repos/diced/zipline';
const DEFAULT_CACHE_TTL = 300; // 5 minutes

export const API_CACHE_KEYS = {
  latestTag: 'zipline:releases:latest',
  latestCommit: 'zipline:commits:latest',
  tagsAll: 'zipline:tags:all',
  checkRuns: (sha: string) => `zipline:check-runs:${sha}`,
};

const getHeaders = (token?: string) => ({
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'zipline',
  ...(token ? { Authorization: `token ${token}` } : {}),
});

async function cachedFetch<T>(env: Env, key: string, url: string, ttl = DEFAULT_CACHE_TTL): Promise<T | null> {
  const cached = await env.ZIPLINE_VERSION_CACHE.get(key);
  if (cached) return JSON.parse(cached) as T;

  const res = await fetch(url, { headers: getHeaders(env.GITHUB_TOKEN) });
  if (!res.ok) return null;

  const data: T = await res.json();
  await env.ZIPLINE_VERSION_CACHE.put(key, JSON.stringify(data), {
    expirationTtl: ttl,
    metadata: {
      added: Date.now(),
      ttl,
    },
  });
  return data;
}

export async function getLatestTag(env: Env): Promise<string | null> {
  const data = await cachedFetch<LatestRelease>(env, API_CACHE_KEYS.latestTag, `${GITHUB_API_BASE}/releases/latest`);
  return data?.tag_name ?? null;
}

export async function getLatestCommit(env: Env): Promise<{ sha: string; pull: boolean } | null> {
  const commits = await cachedFetch<Commits>(env, API_CACHE_KEYS.latestCommit, `${GITHUB_API_BASE}/commits`);
  if (!commits || commits.length === 0) return null;

  const sha = commits[0].sha;

  const checkRuns = await cachedFetch<CheckRuns>(env, API_CACHE_KEYS.checkRuns(sha), `${GITHUB_API_BASE}/commits/${sha}/check-runs`);
  if (!checkRuns) return { sha, pull: false };

  const run = checkRuns.check_runs.find((r) => r.name === 'amend-builds');
  const pull = run?.status === 'completed' && run?.conclusion === 'success';

  return { sha, pull };
}

export async function getTagFromSha(sha: string, env: Env): Promise<Tags[0] | null> {
  const tags = await cachedFetch<Tags>(env, API_CACHE_KEYS.tagsAll, `${GITHUB_API_BASE}/tags`);
  console.log(tags);
  return tags?.filter((t) => t.name.startsWith('v4')).find((t) => t.commit.sha.slice(0, 7) === sha) || null;
}

export async function getTagFromName(name: string, env: Env): Promise<Tags[0] | null> {
  const tags = await cachedFetch<Tags>(env, API_CACHE_KEYS.tagsAll, `${GITHUB_API_BASE}/tags`);
  return tags?.filter((t) => t.name.startsWith('v4')).find((t) => t.name.includes(name)) || null;
}
