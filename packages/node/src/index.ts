import { CachedGitHubApi, createVersionApp } from 'common';
import { serve } from '@hono/node-server';
import { InMemoryCache } from './in-memory-cache';

const inMemoryCache = new InMemoryCache();
const api = new CachedGitHubApi(inMemoryCache);

const app = createVersionApp(inMemoryCache, api);

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT ?? null) == 0 ? 8787 : Number(process.env.PORT),
    hostname: process.env.HOSTNAME ?? '0.0.0.0',
  },
  (info) => {
    console.log(`Server is running on http://${info.address}:${info.port}`);
  }
);
