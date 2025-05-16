# Zipline Version

over engineered version checking software for [Zipline](https://github.com/diced/zipline).

The repository is a monorepo that contains three packages:
- [common](packages/common) - Common code used across the `node` and `worker` packages.
- [node](packages/node) - The node.js compatible server
- [worker](packages/worker) - The Cloudflare Worker that serves the version checking API

For more information on how to run your own version checking server, see the respective [`node`](packages/node/README.md) and [`worker`](packages/worker/README.md) README files.

## Usage

This sections documents the API that is the same across both runtimes.

**Method:** `GET`

**Base URL:** https://zipline-version.diced.sh/ (or your own server url)

### Query Parameters

| Parameter | Type        | Required | Description                                                                                                      |
| --------- | ----------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `version` | string      | Yes\*    | Version without the `v` prefix (e.g., `4.0.2`)                                                                   |
| `sha`     | string      | Yes\*    | Short SHA (7-chars) of the commit (e.g., `abc1234`)                                                              |
| `details` | JSON string | No       | Alternative to `version` and `sha`, in the form `{"version":"4.0.2","sha":"abcdefg"}`. This must be URL encoded. |

> You must provide either the `details` parameter or both `version` and `sha`.

### Response (JSON)

| Field        | Type    | Description                                                     |
| ------------ | ------- | --------------------------------------------------------------- |
| `isUpstream` | boolean | Whether the version is an upstream (non-release) commit         |
| `isRelease`  | boolean | Whether the version is part of an official release              |
| `isLatest`   | boolean | Whether the version matches the latest release or latest commit |
| `version`    | object  | Metadata about the inspected version                            |
| `latest`     | object  | Metadata about the latest available version/commit              |

### Example Request

```bash
curl -X GET "https://zipline-version.diced.sh/?version=4.0.2&sha=abc1234"
```

### Example Response (up-to-date commit)

```json
{
  "latest": {
    "tag": "v4.0.2",
    "url": "https://github.com/diced/zipline/releases/v4.0.2",
    "commit": {
      "sha": "25a2a54d8a062914677f0517430599300ae538ab",
      "url": "https://github.com/diced/zipline/commit/25a2a54d8a062914677f0517430599300ae538ab",
      "pull": true
    }
  },
  "isUpstream": true,
  "isRelease": false,
  "isLatest": false,
  "version": {
    "sha": "08eb2df",
    "url": "https://github.com/diced/zipline/commit/08eb2df"
  }
}
```

### Example Response (outdated commit)

```json
{
  "latest": {
    "tag": "v4.0.2",
    "url": "https://github.com/diced/zipline/releases/v4.0.2",
    "commit": {
      "sha": "25a2a54d8a062914677f0517430599300ae538ab",
      "url": "https://github.com/diced/zipline/commit/25a2a54d8a062914677f0517430599300ae538ab",
      "pull": true
    }
  },
  "isUpstream": true,
  "isRelease": false,
  "isLatest": false,
  "version": {
    "sha": "35c37c2",
    "url": "https://github.com/diced/zipline/commit/35c37c2"
  }
}
```

### Example Response (latest release)

```json
{
  "latest": {
    "tag": "v4.0.2",
    "url": "https://github.com/diced/zipline/releases/v4.0.2"
  },
  "isUpstream": false,
  "isRelease": true,
  "isLatest": true,
  "version": {
    "tag": "v4.0.2",
    "sha": "e8207addba093aa902c9ca22be4bc800ad8930f6",
    "url": "https://github.com/diced/zipline/releases/v4.0.2"
  }
}
```

### Example Response (outdated release)

```json
{
  "latest": {
    "tag": "v4.0.2",
    "url": "https://github.com/diced/zipline/releases/v4.0.2"
  },
  "isUpstream": false,
  "isRelease": true,
  "isLatest": false,
  "version": {
    "tag": "v4.0.1",
    "sha": "ba6d5eb654a7c57633aa58e6153666067c157af3",
    "url": "https://github.com/diced/zipline/releases/v4.0.1"
  }
}
```

## Errors

There are a few custom error codes that are returned in JSON under the `error_code` field.
| Code | Description |
| ---- | ----------- |
| `1000` | missing `version` or `sha` query parameter, or the `details` query paramter is formatted incorrectly |
| `1001` | the server/worker is unable to connect to the GitHub API to fetch the latest release |
| `1002` | the server/worker received a tag that doesn't exist |

## Extra Stuff

Get cache lengths by visiting `/cache`. Append `.json` to the URL to get a JSON array response.

```txt
Name: zipline:check-runs:08eb2df26c6f11f3b4158f28f82e990d0fc2371a
  Expiration: 5/11/2025, 10:19:16 PM
  Metadata:
    Added: 5/11/2025, 10:14:16 PM
    TTL: 300 seconds

Name: zipline:commits:latest
  Expiration: 5/11/2025, 10:19:15 PM
  Metadata:
    Added: 5/11/2025, 10:14:15 PM
    TTL: 300 seconds

Name: zipline:releases:latest
  Expiration: 5/11/2025, 10:19:15 PM
  Metadata:
    Added: 5/11/2025, 10:14:15 PM
    TTL: 300 seconds

Name: zipline:tags:all
  Expiration: 5/11/2025, 10:19:15 PM
  Metadata:
    Added: 5/11/2025, 10:14:15 PM
    TTL: 300 seconds
```
