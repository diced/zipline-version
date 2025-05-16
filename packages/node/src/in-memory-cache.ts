import { BaseCache, CacheKeyEntry, CacheMetadata, CacheSetOptions } from 'common';

export class InMemoryCache extends BaseCache {
  private store = new Map<
    string,
    {
      value: string;
      metadata: CacheMetadata;
      customMetadata?: Record<string, any>;
    }
  >();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    const now = Date.now();
    const expiresAt = entry.metadata.added + entry.metadata.ttl * 1000;

    if (now > expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: string, options?: CacheSetOptions): Promise<void> {
    const now = Date.now();
    const ttl = options?.expirationTtl ?? 300;

    this.store.set(key, {
      value,
      metadata: {
        added: now,
        ttl,
      },
      customMetadata: options?.metadata,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async listKeys(): Promise<CacheKeyEntry[]> {
    const now = Date.now();
    const entries: CacheKeyEntry[] = [];

    for (const [key, { metadata }] of this.store.entries()) {
      const expiresAt = metadata.added + metadata.ttl * 1000;

      if (now > expiresAt) {
        this.store.delete(key);
        continue;
      }

      entries.push({
        name: key,
        expiration: Math.floor(expiresAt / 1000),
        metadata,
      });
    }

    return entries;
  }
}
