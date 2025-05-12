# Zipline Version Worker

Cloudflare Worker that tests versions/commit shas of [Zipline](https://github.com/diced/zipline) and returns relevant information based on the version.

## Usage

**Method:** `GET`

**Base URL:** https://zipline-version.diced.sh/

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