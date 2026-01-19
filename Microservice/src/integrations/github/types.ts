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
