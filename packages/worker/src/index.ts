import { CachedGitHubApi, createVersionApp } from 'common';
import { WorkersKVCache } from './workers-kv-cache';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS')
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
          'Access-Control-Max-Age': '86400',
        },
      });

    const workersKvCache = new WorkersKVCache(env);
    const api = new CachedGitHubApi(workersKvCache, env.GITHUB_TOKEN);
    const app = createVersionApp(workersKvCache, api);

    return app.fetch(request, env);
  },
};
