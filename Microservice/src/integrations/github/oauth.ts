import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

import type {
  InstallationRepository,
  InstallationToken,
  GitHubAppInstallation,
  OAuthTokenResponse,
} from './types.js';

/**
 * GitHub App authentication and OAuth utilities
 */
export class GitHubOAuth {
  private appOctokit: Octokit;

  constructor() {
    if (!config.github.appId || !config.github.privateKey) {
      throw new Error('GitHub App credentials not configured');
    }

    // Create authenticated Octokit instance for the GitHub App
    this.appOctokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: config.github.appId,
        privateKey: config.github.privateKey,
      },
    });
  }

  /**
   * Gets an installation access token for a specific installation
   */
  async getInstallationToken(installationId: number): Promise<InstallationToken> {
    try {
      const { data } = await this.appOctokit.apps.createInstallationAccessToken({
        installation_id: installationId,
      });

      logger.debug({ installationId }, 'Created installation access token');

      return {
        token: data.token,
        expiresAt: data.expires_at,
        permissions: data.permissions as Record<string, string>,
        repositorySelection: data.repository_selection,
      };
    } catch (error) {
      logger.error({ error, installationId }, 'Failed to create installation token');
      throw error;
    }
  }

  /**
   * Lists all installations of the GitHub App
   */
  async listInstallations(): Promise<GitHubAppInstallation[]> {
    try {
      const { data } = await this.appOctokit.apps.listInstallations();

      return data.map((installation) => {
        const account = installation.account as { login?: string; name?: string; type?: string; avatar_url?: string } | null;
        const accountLogin = account?.login ?? account?.name ?? 'unknown';

        return {
          id: installation.id,
          account: {
            login: accountLogin,
            type: account?.type ?? 'unknown',
            avatarUrl: account?.avatar_url,
          },
          repositorySelection: installation.repository_selection,
          permissions: installation.permissions as Record<string, string>,
          events: installation.events,
          createdAt: installation.created_at,
          updatedAt: installation.updated_at,
          suspendedAt: installation.suspended_at ?? undefined,
        };
      });
    } catch (error) {
      logger.error({ error }, 'Failed to list installations');
      throw error;
    }
  }

  /**
   * Gets details of a specific installation
   */
  async getInstallation(installationId: number): Promise<GitHubAppInstallation> {
    try {
      const { data } = await this.appOctokit.apps.getInstallation({
        installation_id: installationId,
      });

      // Account can be User or Organization - handle both types
      const account = data.account as { login?: string; name?: string; type?: string; avatar_url?: string } | null;
      const accountLogin = account?.login ?? account?.name ?? 'unknown';

      return {
        id: data.id,
        account: {
          login: accountLogin,
          type: account?.type ?? 'unknown',
          avatarUrl: account?.avatar_url,
        },
        repositorySelection: data.repository_selection,
        permissions: data.permissions as Record<string, string>,
        events: data.events,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        suspendedAt: data.suspended_at ?? undefined,
      };
    } catch (error) {
      logger.error({ error, installationId }, 'Failed to get installation');
      throw error;
    }
  }

  /**
   * Lists repositories accessible to an installation
   */
  async listInstallationRepositories(installationId: number): Promise<InstallationRepository[]> {
    try {
      const token = await this.getInstallationToken(installationId);
      const octokit = new Octokit({ auth: token.token });

      const repos: InstallationRepository[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const { data } = await octokit.apps.listReposAccessibleToInstallation({
          per_page: 100,
          page,
        });

        for (const repo of data.repositories) {
          repos.push({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            private: repo.private,
            defaultBranch: repo.default_branch,
            language: repo.language ?? undefined,
            description: repo.description ?? undefined,
            htmlUrl: repo.html_url,
            owner: {
              login: repo.owner.login,
              type: repo.owner.type,
            },
          });
        }

        if (data.repositories.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }

      logger.debug({ installationId, count: repos.length }, 'Listed installation repositories');
      return repos;
    } catch (error) {
      logger.error({ error, installationId }, 'Failed to list installation repositories');
      throw error;
    }
  }

  /**
   * Exchanges an OAuth code for an access token (for user OAuth flow)
   */
  async exchangeCodeForToken(
    code: string,
    clientId: string,
    clientSecret: string
  ): Promise<OAuthTokenResponse> {
    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const data: unknown = await response.json();
      const errorData = data as { error?: string };

      if (errorData.error) {
        throw new Error(`OAuth error: ${errorData.error}`);
      }

      logger.debug('Exchanged OAuth code for token');
      return data as OAuthTokenResponse;
    } catch (error) {
      logger.error({ error }, 'Failed to exchange OAuth code');
      throw error;
    }
  }

  /**
   * Gets the authenticated user's information
   */
  async getUser(accessToken: string): Promise<{
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatarUrl: string;
  }> {
    try {
      const octokit = new Octokit({ auth: accessToken });
      const { data } = await octokit.users.getAuthenticated();

      return {
        id: data.id,
        login: data.login,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatar_url,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get authenticated user');
      throw error;
    }
  }

  /**
   * Gets the user's installations of the app
   */
  async getUserInstallations(accessToken: string): Promise<GitHubAppInstallation[]> {
    try {
      const octokit = new Octokit({ auth: accessToken });
      const { data } = await octokit.apps.listInstallationsForAuthenticatedUser();

      return data.installations.map((installation) => {
        const account = installation.account as { login?: string; name?: string; type?: string; avatar_url?: string } | null;
        const accountLogin = account?.login ?? account?.name ?? 'unknown';

        return {
          id: installation.id,
          account: {
            login: accountLogin,
            type: account?.type ?? 'unknown',
            avatarUrl: account?.avatar_url,
          },
          repositorySelection: installation.repository_selection,
          permissions: installation.permissions as Record<string, string>,
          events: installation.events,
          createdAt: installation.created_at,
          updatedAt: installation.updated_at,
          suspendedAt: installation.suspended_at ?? undefined,
        };
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get user installations');
      throw error;
    }
  }
}

// Singleton instance
let oauthInstance: GitHubOAuth | null = null;

/**
 * Gets the GitHub OAuth singleton instance
 */
export function getGitHubOAuth(): GitHubOAuth {
  if (!oauthInstance) {
    oauthInstance = new GitHubOAuth();
  }
  return oauthInstance;
}
