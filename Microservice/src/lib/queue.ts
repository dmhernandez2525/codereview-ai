import { Queue, Worker, Job } from 'bullmq';

import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

import type { ReviewJobData, ReviewJobResult } from '../types/index.js';

// Queue names
export const QUEUE_NAMES = {
  REVIEW: 'code-review',
} as const;

// Queue instances
let reviewQueue: Queue<ReviewJobData, ReviewJobResult> | null = null;
let reviewWorker: Worker<ReviewJobData, ReviewJobResult> | null = null;

/**
 * Redis connection options for BullMQ
 */
function getConnectionOptions() {
  return {
    host: config.redis.host,
    port: config.redis.port,
    maxRetriesPerRequest: null,
  };
}

/**
 * Creates and returns the review queue instance.
 */
export function getReviewQueue(): Queue<ReviewJobData, ReviewJobResult> {
  if (reviewQueue) {
    return reviewQueue;
  }

  reviewQueue = new Queue<ReviewJobData, ReviewJobResult>(QUEUE_NAMES.REVIEW, {
    connection: getConnectionOptions(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: {
        count: 100, // Keep last 100 completed jobs
        age: 24 * 60 * 60, // Keep for 24 hours
      },
      removeOnFail: {
        count: 500, // Keep last 500 failed jobs for debugging
      },
    },
  });

  reviewQueue.on('error', (err) => {
    logger.error({ error: err.message, queue: QUEUE_NAMES.REVIEW }, 'Queue error');
  });

  logger.info({ queue: QUEUE_NAMES.REVIEW }, 'Review queue initialized');
  return reviewQueue;
}

/**
 * Adds a review job to the queue.
 */
export async function addReviewJob(
  data: ReviewJobData
): Promise<Job<ReviewJobData, ReviewJobResult>> {
  const queue = getReviewQueue();
  const job = await queue.add(`review-${data.repositoryId}-${data.prNumber}`, data, {
    priority: data.priority ?? 1,
  });

  logger.info(
    { jobId: job.id, repositoryId: data.repositoryId, prNumber: data.prNumber },
    'Review job added to queue'
  );

  return job;
}

/**
 * Starts the review worker to process jobs.
 * The processor function should be provided by the caller.
 */
export function startReviewWorker(
  processor: (job: Job<ReviewJobData, ReviewJobResult>) => Promise<ReviewJobResult>
): Worker<ReviewJobData, ReviewJobResult> {
  if (reviewWorker) {
    return reviewWorker;
  }

  reviewWorker = new Worker<ReviewJobData, ReviewJobResult>(QUEUE_NAMES.REVIEW, processor, {
    connection: getConnectionOptions(),
    concurrency: 3, // Process up to 3 reviews concurrently
    limiter: {
      max: 10, // Max 10 jobs per minute to avoid rate limits
      duration: 60000,
    },
  });

  reviewWorker.on('completed', (job, result) => {
    logger.info(
      {
        jobId: job.id,
        repositoryId: job.data.repositoryId,
        prNumber: job.data.prNumber,
        tokensUsed: result.tokensUsed,
      },
      'Review job completed'
    );
  });

  reviewWorker.on('failed', (job, err) => {
    logger.error(
      {
        jobId: job?.id,
        error: err.message,
        repositoryId: job?.data.repositoryId,
        prNumber: job?.data.prNumber,
      },
      'Review job failed'
    );
  });

  reviewWorker.on('error', (err) => {
    logger.error({ error: err.message }, 'Worker error');
  });

  logger.info({ queue: QUEUE_NAMES.REVIEW, concurrency: 3 }, 'Review worker started');
  return reviewWorker;
}

/**
 * Gracefully closes the queue and worker.
 */
export async function closeQueues(): Promise<void> {
  if (reviewWorker) {
    await reviewWorker.close();
    reviewWorker = null;
    logger.info('Review worker closed');
  }

  if (reviewQueue) {
    await reviewQueue.close();
    reviewQueue = null;
    logger.info('Review queue closed');
  }
}

/**
 * Returns queue statistics for health checks.
 */
export async function getQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}> {
  const queue = getReviewQueue();
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
  ]);

  return { waiting, active, completed, failed };
}
