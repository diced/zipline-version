export interface VersionResponse {
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

export type VersionDetails = {
  version: string;
  sha: string;
}

