import type { Tags, LatestRelease, Commits, CheckRuns } from './types';
import { BaseCache, CACHE_KEYS } from '../cache';

const GITHUB_API_BASE = 'https://api.github.com/repos/diced/zipline';
const DEFAULT_CACHE_TTL = 300; // 5 minutes

const getHeaders = (token?: string) => ({
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'zipline',
  ...(token ? { Authorization: `token ${token}` } : {}),
});

export async function cachedFetch<T>(
  cache: BaseCache,
  key: string,
  url: string,
  ttl = DEFAULT_CACHE_TTL,
  githubToken?: string
): Promise<T | null> {
  const cached = await cache.get(key);
  if (cached) return JSON.parse(cached) as T;

  const res = await fetch(url, {
    headers: getHeaders(githubToken),
  });

  if (!res.ok) return null;

  const data: T = await res.json();
  await cache.set(key, JSON.stringify(data), {
    expirationTtl: ttl,
    metadata: {
      added: Date.now(),
      ttl,
    },
  });
  return data;
}

export class CachedGitHubApi {
  constructor(private cache: BaseCache, protected githubToken?: string) {}

  public async getLatestTag(): Promise<string | null> {
    const data = await cachedFetch<LatestRelease>(
      this.cache,
      CACHE_KEYS.latestTag,
      `${GITHUB_API_BASE}/releases/latest`,
      300,
      this.githubToken
    );
    return data?.tag_name ?? null;
  }

  public async getLatestCommit(): Promise<{ sha: string; pull: boolean } | null> {
    const commits = await cachedFetch<Commits>(this.cache, CACHE_KEYS.latestCommit, `${GITHUB_API_BASE}/commits`, 300, this.githubToken);
    if (!commits || commits.length === 0) return null;

    const sha = commits[0].sha;

    const checkRuns = await cachedFetch<CheckRuns>(
      this.cache,
      CACHE_KEYS.checkRuns(sha),
      `${GITHUB_API_BASE}/commits/${sha}/check-runs`,
      300,
      this.githubToken
    );
    if (!checkRuns) return { sha, pull: false };

    const run = checkRuns.check_runs.find((r) => r.name === 'amend-builds');
    const pull = run?.status === 'completed' && run?.conclusion === 'success';

    return { sha, pull };
  }

  public async getTagFromSha(sha: string): Promise<Tags[0] | null> {
    const tags = await cachedFetch<Tags>(this.cache, CACHE_KEYS.tagsAll, `${GITHUB_API_BASE}/tags`, 300, this.githubToken);
    return tags?.filter((t) => t.name.startsWith('v4')).find((t) => t.commit.sha.slice(0, 7) === sha) || null;
  }

  public async getTagFromName(name: string): Promise<Tags[0] | null> {
    const tags = await cachedFetch<Tags>(this.cache, CACHE_KEYS.tagsAll, `${GITHUB_API_BASE}/tags`, 300, this.githubToken);
    return tags?.filter((t) => t.name.startsWith('v4')).find((t) => t.name.includes(name)) || null;
  }
}
