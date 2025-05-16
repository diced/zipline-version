# `common`

This package contains common code used across the `node` and `worker` packages.

## Overview
- a [Hono](https://hono.dev/) app that is exported as a function
- cache abstraction that is implemented in the `node` and `worker` packages using a in-memory cache and a KV store, respectively
- github api helper that is used in the app to fetch various information from github
- types for the api and github api

## Usage
```ts
import { BaseCache, CachedGitHubApi, createVersionApp } from 'common';

class MyCache extends BaseCache {
  // implement the methods
}

const cache = new MyCache();
const api = new CachedGitHubApi(cache, "github token");
const app = createVersionApp(cache, api);

// most likely using the app.fetch() method
const response = await app.fetch(request);
```