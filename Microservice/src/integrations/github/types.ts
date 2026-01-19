/**
 * GitHub integration types
 */

export interface PullRequestDetails {
  number: number;
  title: string;
  body: string;
  state: string;
  url: string;
  author: string;
  headSha: string;
  baseSha: string;
  headRef: string;
  baseRef: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  createdAt: string;
  updatedAt: string;
}

export interface PullRequestFile {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  contentsUrl: string;
}

export interface ReviewCommentPayload {
  body: string;
  commitId: string;
  path: string;
  line: number;
  side?: 'LEFT' | 'RIGHT';
}

export interface WebhookPayload {
  action: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
    owner: {
      login: string;
    };
  };
  sender: {
    login: string;
  };
  installation?: {
    id: number;
  };
}

export interface PullRequestWebhookPayload extends WebhookPayload {
  action: 'opened' | 'synchronize' | 'reopened' | 'closed' | 'edited';
  number: number;
  pull_request: {
    number: number;
    title: string;
    body: string | null;
    state: string;
    html_url: string;
    user: {
      login: string;
    };
    head: {
      sha: string;
      ref: string;
    };
    base: {
      sha: string;
      ref: string;
    };
    additions: number;
    deletions: number;
    changed_files: number;
    created_at: string;
    updated_at: string;
  };
}

export interface InstallationWebhookPayload extends WebhookPayload {
  action: 'created' | 'deleted' | 'suspend' | 'unsuspend';
  installation: {
    id: number;
    account: {
      login: string;
      type: string;
    };
  };
  repositories?: Array<{
    id: number;
    name: string;
    full_name: string;
  }>;
}

// =========================================================================
// OAuth & Installation Types
// =========================================================================

export interface InstallationToken {
  token: string;
  expiresAt: string;
  permissions: Record<string, string>;
  repositorySelection: string | undefined;
}

export interface GitHubAppInstallation {
  id: number;
  account: {
    login: string;
    type: string;
    avatarUrl: string | undefined;
  };
  repositorySelection: string;
  permissions: Record<string, string>;
  events: string[];
  createdAt: string;
  updatedAt: string;
  suspendedAt: string | undefined;
}

export interface InstallationRepository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
  language: string | undefined;
  description: string | undefined;
  htmlUrl: string;
  owner: {
    login: string;
    type: string;
  };
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
}
