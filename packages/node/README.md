# `node`

This package contains the node.js compatible server that serves the version checking API.

## Overview

- an in-memory cache (internal `Map`) that is used to store the results of the API calls
- using the [Hono](https://hono.dev) app exported from the [`common`](../common) package

## Build & Run

```bash
pnpm install
pnpm build
pnpm start
```

## Configuration

Additional configuration is done by environment variables.
| Variable | Description | Default |
| -------- | ----------- | ------- |
| `GITHUB_TOKEN` | GitHub token used to authenticate with the GitHub API | nothing, but is recommended to bypass normal ratelimits |
| `PORT` | Port to listen on | `3000` |
| `HOSTNAME` | Hostname to listen on | `0.0.0.0` |

# Example with Zipline

If you are already running Zipline with docker-compose, you can simply add the following to your `docker-compose.yml` file:

```yaml
version-checker:
  image: ghcr.io/diced/zipline-version:latest
  restart: unless-stopped
  environment:
    - HOSTNAME=0.0.0.0
```

then, head to the Server Settings page, scroll down to the "Version Checking API" section, and set the URL to `http://version-checker:3000`.

