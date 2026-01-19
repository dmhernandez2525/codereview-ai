import crypto from 'crypto';

import { config } from '../../config/index.js';
import { addReviewJob } from '../../lib/queue.js';
import { strapiClient } from '../../lib/strapi.js';
import { logger } from '../../utils/logger.js';

import type { PullRequestWebhookPayload, InstallationWebhookPayload } from './types.js';
import type { Request, Response, NextFunction } from 'express';

/**
 * Verifies the GitHub webhook signature.
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string | undefined,
  secret: string
): boolean {
  if (!signature) {
    return false;
  }

  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')}`;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Express middleware for verifying GitHub webhook signatures.
 */
export function webhookSignatureMiddleware(req: Request, res: Response, next: NextFunction): void {
  const signature = req.headers['x-hub-signature-256'] as string | undefined;
  const payload = JSON.stringify(req.body);

  if (!verifyWebhookSignature(payload, signature, config.github.webhookSecret)) {
    logger.warn('Invalid webhook signature');
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  next();
}

/**
 * Handles pull_request webhook events.
 */
export async function handlePullRequestEvent(payload: PullRequestWebhookPayload): Promise<void> {
  const { action, pull_request: pr, repository, installation } = payload;

  logger.info(
    {
      action,
      pr: pr.number,
      repo: repository.full_name,
      author: pr.user.login,
    },
    'Pull request event received'
  );

  // Only process opened, synchronize (new commits), and reopened events
  if (!['opened', 'synchronize', 'reopened'].includes(action)) {
    logger.debug({ action }, 'Skipping non-review action');
    return;
  }

  // Find the repository in Strapi
  const repos = await strapiClient.getRepositoryByExternalId('github', repository.id.toString());

  if (repos.data.length === 0) {
    logger.warn({ repo: repository.full_name }, 'Repository not registered');
    return;
  }

  const repoData = repos.data[0];

  if (!repoData) {
    logger.warn({ repo: repository.full_name }, 'Repository data missing');
    return;
  }

  if (!repoData.attributes.isActive) {
    logger.info({ repo: repository.full_name }, 'Repository is disabled');
    return;
  }

  const repoId = repoData.id;

  // Create a review record in Strapi
  const review = await strapiClient.createReview({
    prNumber: pr.number,
    prTitle: pr.title,
    prUrl: pr.html_url,
    prAuthor: pr.user.login,
    headSha: pr.head.sha,
    baseSha: pr.base.sha,
    status: 'pending',
    tokensUsed: 0,
    metadata: {
      action,
      installationId: installation?.id,
    },
    repository: { data: { id: repoId } },
  });

  // Add job to the review queue
  await addReviewJob({
    repositoryId: repoId,
    prNumber: pr.number,
    prTitle: pr.title,
    prUrl: pr.html_url,
    prAuthor: pr.user.login,
    headSha: pr.head.sha,
    baseSha: pr.base.sha,
    diff: '', // Will be fetched by the worker
    platform: 'github',
    priority: action === 'opened' ? 1 : 2, // New PRs get higher priority
  });

  logger.info(
    {
      reviewId: review.data.id,
      pr: pr.number,
      repo: repository.full_name,
    },
    'Review job queued'
  );
}

/**
 * Handles installation webhook events.
 */
export function handleInstallationEvent(payload: InstallationWebhookPayload): void {
  const { action, installation, repositories } = payload;

  logger.info(
    {
      action,
      installationId: installation.id,
      account: installation.account.login,
      repositories: repositories?.length ?? 0,
    },
    'Installation event received'
  );

  // Handle installation created/deleted events
  // This would typically sync repositories with Strapi
  switch (action) {
    case 'created':
      logger.info({ account: installation.account.login }, 'New GitHub App installation');
      // TODO: Create organization and repositories in Strapi
      break;

    case 'deleted':
      logger.info({ account: installation.account.login }, 'GitHub App installation removed');
      // TODO: Mark repositories as inactive in Strapi
      break;

    default:
      logger.debug({ action }, 'Unhandled installation action');
  }
}

/**
 * Main webhook handler that routes to specific event handlers.
 */
export async function handleWebhook(
  event: string,
  payload: unknown
): Promise<{ processed: boolean; message: string }> {
  try {
    switch (event) {
      case 'pull_request':
        await handlePullRequestEvent(payload as PullRequestWebhookPayload);
        return { processed: true, message: 'Pull request event processed' };

      case 'installation':
      case 'installation_repositories':
        handleInstallationEvent(payload as InstallationWebhookPayload);
        return { processed: true, message: 'Installation event processed' };

      case 'ping':
        logger.info('Received ping event');
        return { processed: true, message: 'Pong!' };

      default:
        logger.debug({ event }, 'Unhandled webhook event');
        return { processed: false, message: `Event ${event} not handled` };
    }
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error', event },
      'Webhook handler error'
    );
    throw error;
  }
}
