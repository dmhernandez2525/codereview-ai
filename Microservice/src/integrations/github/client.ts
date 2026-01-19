import { Octokit } from '@octokit/rest';

import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

import type { PullRequestFile, PullRequestDetails, ReviewCommentPayload } from './types.js';

/**
 * GitHub API client for interacting with repositories and pull requests.
 */
export class GitHubClient {
  private octokit: Octokit;

  constructor(accessToken?: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  /**
   * Creates a client authenticated as a GitHub App installation.
   */
  static async fromAppInstallation(installationId: number): Promise<GitHubClient> {
    // For now, use the app's private key to get an installation token
    // This would typically use @octokit/auth-app
    const octokit = new Octokit({
      auth: config.github.privateKey,
    });

    // Get installation access token
    const { data } = await octokit.apps.createInstallationAccessToken({
      installation_id: installationId,
    });

    return new GitHubClient(data.token);
  }

  /**
   * Gets details of a pull request.
   */
  async getPullRequest(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<PullRequestDetails> {
    const { data } = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });

    return {
      number: data.number,
      title: data.title,
      body: data.body ?? '',
      state: data.state,
      url: data.html_url,
      author: data.user?.login ?? 'unknown',
      headSha: data.head.sha,
      baseSha: data.base.sha,
      headRef: data.head.ref,
      baseRef: data.base.ref,
      additions: data.additions,
      deletions: data.deletions,
      changedFiles: data.changed_files,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Gets the diff of a pull request.
   */
  async getPullRequestDiff(owner: string, repo: string, pullNumber: number): Promise<string> {
    const { data } = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
      mediaType: {
        format: 'diff',
      },
    });

    // When requesting diff format, data is a string
    return data as unknown as string;
  }

  /**
   * Gets the list of files changed in a pull request.
   */
  async getPullRequestFiles(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<PullRequestFile[]> {
    const files: PullRequestFile[] = [];
    let page = 1;

    let hasMore = true;
    while (hasMore) {
      const { data } = await this.octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber,
        per_page: 100,
        page,
      });

      if (data.length === 0) {
        hasMore = false;
      } else {
        for (const file of data) {
          const prFile: PullRequestFile = {
            filename: file.filename,
            status: file.status,
            additions: file.additions,
            deletions: file.deletions,
            changes: file.changes,
            contentsUrl: file.contents_url,
          };
          if (file.patch !== undefined) {
            prFile.patch = file.patch;
          }
          files.push(prFile);
        }

        if (data.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }

    return files;
  }

  /**
   * Gets the contents of a file from a repository.
   */
  async getFileContents(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<string | null> {
    try {
      const params: { owner: string; repo: string; path: string; ref?: string } = {
        owner,
        repo,
        path,
      };
      if (ref !== undefined) {
        params.ref = ref;
      }
      const { data } = await this.octokit.repos.getContent(params);

      if ('content' in data && data.type === 'file') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }

      return null;
    } catch (error) {
      if ((error as { status?: number }).status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Gets the .codereview.yaml configuration from a repository.
   */
  async getCodeReviewConfig(owner: string, repo: string, ref?: string): Promise<string | null> {
    // Try multiple possible locations
    const paths = ['.codereview.yaml', '.codereview.yml', '.github/codereview.yaml'];

    for (const path of paths) {
      const content = await this.getFileContents(owner, repo, path, ref);
      if (content) {
        logger.debug({ path, owner, repo }, 'Found codereview config');
        return content;
      }
    }

    return null;
  }

  /**
   * Creates a review comment on a pull request.
   */
  async createReviewComment(
    owner: string,
    repo: string,
    pullNumber: number,
    comment: ReviewCommentPayload
  ): Promise<number> {
    const { data } = await this.octokit.pulls.createReviewComment({
      owner,
      repo,
      pull_number: pullNumber,
      body: comment.body,
      commit_id: comment.commitId,
      path: comment.path,
      line: comment.line,
      side: comment.side ?? 'RIGHT',
    });

    return data.id;
  }

  /**
   * Creates a review with multiple comments.
   */
  async createReview(
    owner: string,
    repo: string,
    pullNumber: number,
    body: string,
    event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT',
    comments: Array<{
      path: string;
      line: number;
      body: string;
      side?: 'LEFT' | 'RIGHT';
    }>
  ): Promise<number> {
    const { data } = await this.octokit.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      body,
      event,
      comments: comments.map((c) => ({
        path: c.path,
        line: c.line,
        body: c.body,
        side: c.side ?? 'RIGHT',
      })),
    });

    return data.id;
  }

  /**
   * Creates a general comment on a pull request (not tied to specific code).
   */
  async createIssueComment(
    owner: string,
    repo: string,
    pullNumber: number,
    body: string
  ): Promise<number> {
    const { data } = await this.octokit.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body,
    });

    return data.id;
  }
}
