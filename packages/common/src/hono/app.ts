import { Context, Hono } from 'hono';
import { BaseCache } from '../cache';
import { VersionDetails, VersionResponse } from './types';
import { CachedGitHubApi } from '../github/api';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export function createVersionApp(cache: BaseCache, api: CachedGitHubApi) {
  const app = new Hono();

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  const buildResponse = (c: Context, data: Record<string, any>, status: number = 200) =>
    c.json(data, status as ContentfulStatusCode, {
      ...corsHeaders,
    });

  const buildTextResponse = (c: any, data: string, status: number = 200) =>
    c.text(data, status, {
      ...corsHeaders,
    });

  app.get('/cache*', async (c) => {
    const metadatas = await cache.listKeys();

    if (c.req.url.endsWith('.json')) {
      return buildResponse(c, metadatas);
    }

    return buildTextResponse(c, await BaseCache.prettyPrintKeysMetadata(metadatas));
  });

  app.get('*', async (c) => {
    const searchParams = c.req.query();
    const response: VersionResponse = {};

    let versionDetails: VersionDetails | undefined;
    try {
      versionDetails = JSON.parse(decodeURIComponent(searchParams.details || '{}'));
    } catch {}

    if (!versionDetails || !versionDetails.version || !versionDetails.sha) {
      const version = searchParams.version;
      const sha = searchParams.sha;

      if (!version || !sha) {
        return buildResponse(
          c,
          {
            error: 'missing version or sha',
            error_code: 1000,
          },
          400
        );
      }

      versionDetails = { version, sha };
    }

    const latestTag = await api.getLatestTag();
    if (!latestTag) {
      return buildResponse(c, { error: 'failed to fetch latest tag', error_code: 1001 }, 500);
    }

    const validationTag = await api.getTagFromName(versionDetails.version);
    if (!validationTag) {
      return buildResponse(c, { error: 'invalid tag', error_code: 1002 }, 400);
    }

    response.latest = {
      tag: latestTag,
      url: `https://github.com/diced/zipline/releases/${latestTag}`,
    };

    const tag = await api.getTagFromSha(versionDetails.sha);
    if (tag) {
      response.isUpstream = false;
      response.isRelease = true;
      response.isLatest = latestTag === tag.name;
      response.version = {
        tag: tag.name,
        sha: tag.commit.sha,
        url: `https://github.com/diced/zipline/releases/${tag.name}`,
      };
    } else {
      const latestCommit = await api.getLatestCommit();
      const s = await api.getTagFromName(versionDetails.version);
      response.isUpstream = true;
      response.isRelease = false;
      response.isLatest = latestCommit?.sha.slice(0, 7) === versionDetails.sha;
      response.version = {
        tag: s?.name!,
        sha: versionDetails.sha,
        url: `https://github.com/diced/zipline/commit/${versionDetails.sha}`,
      };

      if (latestCommit) {
        response.latest.commit = {
          sha: latestCommit.sha,
          url: `https://github.com/diced/zipline/commit/${latestCommit.sha}`,
          pull: latestCommit.pull,
        };
      }
    }

    return buildResponse(c, response);
  });

  return app;
}
