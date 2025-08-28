import { BaseCache, CacheKeyEntry, CacheSetOptions } from 'common';

export class WorkersCache extends BaseCache {
  constructor() {
    super();
  }

  private key(key: string): string {
    // cache api requires a valid "url" so lets fake it!
    return 'https://zipline-version-worker.diced.workers.dev/cachedRequests/' + encodeURIComponent(key);
  }

  public async get(key: string): Promise<string | null> {
    const cachedResponse = await caches.default.match(this.key(key));

    if (!cachedResponse) return null;
    return cachedResponse.text();
  }

  public async set(key: string, value: string, options?: CacheSetOptions): Promise<void> {
    const headers = new Headers();

    if (options?.expirationTtl) {
      headers.set('Cache-Control', `public, max-age=${options.expirationTtl}`);
    }


    const response = new Response(value, { headers });
    await caches.default.put(this.key(key), response);
  }

  public async delete(key: string): Promise<void> {
    await caches.default.delete(this.key(key));
  }

  public async listKeys(): Promise<CacheKeyEntry[]> {
    return []; // doesn't support :(
  }
}

