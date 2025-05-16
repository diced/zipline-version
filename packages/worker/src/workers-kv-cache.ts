import { BaseCache, CacheKeyEntry, CacheSetOptions } from 'common';

export class WorkersKVCache extends BaseCache {
  constructor(public env: Env) {
    super();
  }

  public get(key: string): Promise<string | null> {
    return this.env.ZIPLINE_VERSION_CACHE.get(key);
  }

  public set(key: string, value: string, options?: CacheSetOptions): Promise<void> {
    return this.env.ZIPLINE_VERSION_CACHE.put(key, value, {
      expirationTtl: options?.expirationTtl,
      metadata: options?.metadata,
    });
  }

  public delete(key: string): Promise<void> {
    return this.env.ZIPLINE_VERSION_CACHE.delete(key);
  }

  public async listKeys(): Promise<CacheKeyEntry[]> {
    const { keys } = await this.env.ZIPLINE_VERSION_CACHE.list();

    return keys as CacheKeyEntry[];
  }
}
