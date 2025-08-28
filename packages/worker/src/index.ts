import { CachedGitHubApi, createVersionApp } from 'common';
// import { WorkersKVCache } from './workers-kv-cache';
import { WorkersCache } from './workers-cache';

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

    // const cache = new WorkersKVCache(env);
    const cache = new WorkersCache();
    const api = new CachedGitHubApi(cache, env.GITHUB_TOKEN);
    const app = createVersionApp(cache, api);

    return app.fetch(request, env);
  },
};
