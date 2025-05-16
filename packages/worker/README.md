# `worker`

This package contains the Cloudflare Workers code that serves the version checking API.

## Overview

- uses KV namespaces to store the results of the API calls
- using the [Hono](https://hono.dev) app exported from the [`common`](../common) package

## Deploy

First install the dependencies:

```bash
pnpm install
```

Change the namespace IDs in the `wrangler.jsonc`, your configuration should look like this:

```jsonc
"kv_namespaces": [
  {
    "binding": "ZIPLINE_VERSION_CACHE", // do not change!
    "id": "your kv namespace id", // change
  }
],
```

Deploy the worker:

```bash
pnpm deploy
```

Additionally, you can add the GITHUB_TOKEN secret to the worker:

```bash
wrangler secret put GITHUB_TOKEN
```

This will then prompt you for the value of the secret, which you must paste in.