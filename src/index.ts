import { getAllMetadata, prettyPrintMetadata } from './cache';
import { API_CACHE_KEYS, getLatestCommit, getLatestTag, getTagFromName, getTagFromSha } from './github-api';

interface VersionResponse {
  isUpstream?: boolean;
  isRelease?: boolean;
  isLatest?: boolean;
  version?: {
    tag: string;
    sha: string;
    url: string;
  };
  latest?: {
    tag: string;
    url: string;
    commit?: {
      sha: string;
      url: string;
      pull: boolean;
    };
  };
}

type VersionDetails = {
  version: string;
  sha: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          ...corsHeaders,
        },
      });
    }

    const url = new URL(request.url);
    if (url.pathname.startsWith('/cache')) {
      const metadatas = await getAllMetadata(env);
      if (url.pathname.endsWith('.json'))
        return new Response(JSON.stringify(metadatas), {
          headers: {
            'content-type': 'application/json',
            ...corsHeaders,
          },
        });

      return new Response(prettyPrintMetadata(metadatas), {
        headers: {
          'content-type': 'text/plain',
          ...corsHeaders,
        },
      });
    }

    const searchParams = url.searchParams;
    const response: VersionResponse = {};

    let versionDetails: VersionDetails | undefined;
    try {
      versionDetails = JSON.parse(decodeURIComponent(searchParams.get('details') || '{}'));
    } catch {}

    if (!versionDetails || !versionDetails.version || !versionDetails.sha) {
      const version = searchParams.get('version');
      const sha = searchParams.get('sha');

      if (!version || !sha) {
        return new Response('Missing version or sha', { status: 400, headers: corsHeaders });
      }

      versionDetails = { version, sha };
    }

    const latestTag = await getLatestTag(env);
    if (!latestTag) {
      return new Response('Failed to fetch latest tag', { status: 500, headers: corsHeaders });
    }

    // check if the tag they are requesting is a valid tag
    const validationTag = await getTagFromName(versionDetails.version, env);
    if (!validationTag) {
      return new Response('Invalid tag', { status: 400, headers: corsHeaders });
    }

    response.latest = {
      tag: latestTag,
      url: `https://github.com/diced/zipline/releases/${latestTag}`,
    };

    const tag = await getTagFromSha(versionDetails.sha, env);
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
      const latestCommit = await getLatestCommit(env);
      const s = await getTagFromName(versionDetails.version, env);
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

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'content-type': 'application/json', ...corsHeaders },
    });
  },
};
