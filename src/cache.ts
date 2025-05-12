type CacheItem = {
  name: string;
  expiration: number;
  metadata: {
    added: number;
    ttl: number;
  };
};

export async function getAllMetadata(env: Env): Promise<CacheItem[]> {
  const { keys } = await env.ZIPLINE_VERSION_CACHE.list();

  return keys as CacheItem[];
}

export function prettyPrintMetadata(items: CacheItem[]) {
  return items
    .map((item) => {
      const name = item.name;
      const expirationDate = new Date(item.expiration * 1000).toLocaleString();
      const addedDate = new Date(item.metadata.added).toLocaleString();
      const ttlSeconds = item.metadata.ttl;

      return `Name: ${name}
  Expiration: ${expirationDate}
  Metadata:
    Added: ${addedDate}
    TTL: ${ttlSeconds} seconds\n`;
    })
    .join('\n');
}
