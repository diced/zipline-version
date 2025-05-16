import { Endpoints } from '@octokit/types';

export type Tags = Endpoints['GET /repos/{owner}/{repo}/tags']['response']['data'];
export type LatestRelease = Endpoints['GET /repos/{owner}/{repo}/releases/latest']['response']['data'];
export type Commits = Endpoints['GET /repos/{owner}/{repo}/commits']['response']['data'];
export type CheckRuns = Endpoints['GET /repos/{owner}/{repo}/commits/{ref}/check-runs']['response']['data'];
