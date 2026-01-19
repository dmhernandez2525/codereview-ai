/**
 * Review Job Processor
 * Processes review jobs from the Bull queue
 */

import { ReviewService } from './review.service.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

import type { ReviewJobData, ReviewJobResult } from '../types/index.js';
import type { Job } from 'bullmq';

/**
 * Creates a review processor function for the Bull worker.
 */
export function createReviewProcessor(options?: {
  githubToken?: string;
  openaiApiKey?: string;
  model?: string;
}): (job: Job<ReviewJobData, ReviewJobResult>) => Promise<ReviewJobResult> {
  // Create a service instance with the provided options
  const reviewService = new ReviewService({
    githubToken: options?.githubToken ?? config.github?.privateKey,
    openaiApiKey: options?.openaiApiKey ?? config.ai.openai.apiKey,
    model: options?.model ?? 'gpt-4o',
  });

  return async (job: Job<ReviewJobData, ReviewJobResult>): Promise<ReviewJobResult> => {
    logger.info(
      {
        jobId: job.id,
        repositoryId: job.data.repositoryId,
        prNumber: job.data.prNumber,
        attempt: job.attemptsMade + 1,
      },
      'Processing review job'
    );

    try {
      // Update job progress
      await job.updateProgress({ status: 'starting', progress: 0 });

      // Process the review
      const result = await reviewService.processReviewJob(job.data);

      // Update final progress
      await job.updateProgress({ status: 'completed', progress: 100 });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error(
        {
          jobId: job.id,
          error: errorMessage,
          attempt: job.attemptsMade + 1,
          maxAttempts: job.opts.attempts,
        },
        'Review job processing failed'
      );

      // Rethrow to trigger retry if attempts remain
      throw error;
    }
  };
}

/**
 * Validates job data before processing.
 */
export function validateJobData(data: unknown): data is ReviewJobData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const job = data as Partial<ReviewJobData>;

  return (
    typeof job.repositoryId === 'number' &&
    typeof job.prNumber === 'number' &&
    typeof job.prTitle === 'string' &&
    typeof job.prUrl === 'string' &&
    typeof job.prAuthor === 'string' &&
    typeof job.headSha === 'string' &&
    typeof job.baseSha === 'string' &&
    typeof job.diff === 'string' &&
    ['github', 'gitlab', 'bitbucket', 'azure'].includes(job.platform ?? '')
  );
}

/**
 * Creates a job data object from webhook payload.
 */
export function createJobDataFromWebhook(payload: {
  repository: { id: number };
  pullRequest: {
    number: number;
    title: string;
    html_url: string;
    user: { login: string };
    head: { sha: string };
    base: { sha: string };
  };
  diff: string;
  platform: 'github' | 'gitlab' | 'bitbucket' | 'azure';
  config?: ReviewJobData['config'];
}): ReviewJobData {
  const jobData: ReviewJobData = {
    repositoryId: payload.repository.id,
    prNumber: payload.pullRequest.number,
    prTitle: payload.pullRequest.title,
    prUrl: payload.pullRequest.html_url,
    prAuthor: payload.pullRequest.user.login,
    headSha: payload.pullRequest.head.sha,
    baseSha: payload.pullRequest.base.sha,
    diff: payload.diff,
    platform: payload.platform,
    priority: 1,
  };

  if (payload.config) {
    jobData.config = payload.config;
  }

  return jobData;
}
