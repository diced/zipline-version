export const CACHE_KEYS = {
  latestTag: 'zipline:releases:latest',
  latestCommit: 'zipline:commits:latest',
  tagsAll: 'zipline:tags:all',
  checkRuns: (sha: string) => `zipline:check-runs:${sha}`,
};

export const DEFAULT_CACHE_TTL = 300; // 5 minutes

export type CacheMetadata = {
  // timestamp in ms when key was added
  added: number;

  // time-to-live in seconds
  ttl: number;
};

export type CacheKeyEntry = {
  name: string;
  expiration: number;
  metadata: CacheMetadata;
};

export type CacheSetOptions = {
  expirationTtl?: number;
  metadata?: Record<string, any>;
};

export abstract class BaseCache {
  abstract get(key: string): Promise<string | null>;
  abstract set(key: string, value: string, options?: CacheSetOptions): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract listKeys(): Promise<CacheKeyEntry[]>;

  public static async prettyPrintKeysMetadata(items: CacheKeyEntry[]): Promise<string> {
    return items
      .map((item) => {
        const expirationDate = new Date(item.expiration * 1000);
        const addedDate = new Date(item.metadata.added).toLocaleDateString();

        return `Name: ${item.name}
  Expiration: ${expirationDate}
  Metadata:
    Added: ${addedDate}
    TTL: ${item.metadata.ttl} seconds\n`;
      })
      .join('\n');
  }
}
