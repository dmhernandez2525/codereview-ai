/**
 * Review Service
 * Orchestrates the code review process
 */

import { chunkDiff, estimateChunksCost } from './diff-chunker.js';
import { parseDiff } from './diff-parser.js';
import { filterFiles } from './file-filter.js';
import { GitHubClient } from '../integrations/github/client.js';
import { strapiClient } from '../lib/strapi.js';
import { OpenAIProvider } from '../providers/openai/provider.js';
import { logger } from '../utils/logger.js';

import type { DiffChunk } from './diff-chunker.js';
import type { OpenAIReviewResult } from '../providers/openai/provider.js';
import type {
  ReviewConfig,
  ReviewComment as LocalReviewComment,
  ReviewJobData,
  ReviewJobResult,
} from '../types/index.js';

export interface ReviewOptions {
  repositoryId: number;
  prNumber: number;
  diff: string;
  config?: ReviewConfig | undefined;
}

export interface ReviewProgress {
  status: 'parsing' | 'filtering' | 'chunking' | 'reviewing' | 'posting' | 'completed' | 'failed';
  currentChunk?: number;
  totalChunks?: number;
  commentsGenerated?: number;
  commentsPosted?: number;
  error?: string;
}

export interface ReviewServiceResult {
  reviewId: number;
  status: 'completed' | 'failed' | 'skipped';
  comments: LocalReviewComment[];
  summary?: string;
  tokensUsed: number;
  cost: number;
  processingTimeMs: number;
}

/**
 * Main review service that coordinates all review operations.
 */
export class ReviewService {
  private githubClient: GitHubClient | null = null;
  private aiProvider: OpenAIProvider;

  constructor(options?: { githubToken?: string; openaiApiKey?: string; model?: string }) {
    if (options?.githubToken) {
      this.githubClient = new GitHubClient(options.githubToken);
    }
    this.aiProvider = new OpenAIProvider(options?.openaiApiKey, options?.model);
  }

  /**
   * Processes a review job from the queue.
   */
  async processReviewJob(jobData: ReviewJobData): Promise<ReviewJobResult> {
    const startTime = Date.now();
    let reviewId = 0;

    try {
      logger.info(
        {
          repositoryId: jobData.repositoryId,
          prNumber: jobData.prNumber,
        },
        'Starting review job processing'
      );

      // Create review record in Strapi
      reviewId = await this.createReviewRecord(jobData);

      // Update status to in_progress
      await this.updateReviewStatus(reviewId, 'in_progress');

      // Process the review
      const result = await this.generateReview({
        repositoryId: jobData.repositoryId,
        prNumber: jobData.prNumber,
        diff: jobData.diff,
        config: jobData.config,
      });

      // Save comments to Strapi
      await this.saveComments(reviewId, result.comments);

      // Update review with results
      const completionData: { tokensUsed: number; commentsCount: number; summary?: string } = {
        tokensUsed: result.tokensUsed,
        commentsCount: result.comments.length,
      };
      if (result.summary) {
        completionData.summary = result.summary;
      }
      await this.completeReview(reviewId, completionData);

      // Post comments to GitHub if we have a client
      if (this.githubClient && jobData.platform === 'github') {
        await this.postCommentsToGitHub(jobData, result.comments);
      }

      const processingTime = Date.now() - startTime;

      logger.info(
        {
          reviewId,
          commentsCreated: result.comments.length,
          tokensUsed: result.tokensUsed,
          processingTime,
        },
        'Review job completed'
      );

      return {
        reviewId,
        status: 'completed',
        commentsCreated: result.comments.length,
        tokensUsed: result.tokensUsed,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error(
        {
          reviewId,
          error: errorMessage,
          repositoryId: jobData.repositoryId,
          prNumber: jobData.prNumber,
        },
        'Review job failed'
      );

      // Update review status to failed
      if (reviewId) {
        await this.updateReviewStatus(reviewId, 'failed', errorMessage);
      }

      return {
        reviewId,
        status: 'failed',
        commentsCreated: 0,
        tokensUsed: 0,
        processingTime,
        errorMessage,
      };
    }
  }

  /**
   * Generates a code review for the given diff.
   */
  async generateReview(options: ReviewOptions): Promise<{
    comments: LocalReviewComment[];
    summary?: string;
    tokensUsed: number;
    cost: number;
  }> {
    const { diff, config } = options;

    // Parse the diff
    const parsedDiff = parseDiff(diff);

    logger.debug(
      {
        totalFiles: parsedDiff.totalFiles,
        totalAdditions: parsedDiff.totalAdditions,
        totalDeletions: parsedDiff.totalDeletions,
      },
      'Diff parsed'
    );

    // Filter files based on config
    const includePatterns = config?.pathFilters?.filter((p) => !p.startsWith('!')) ?? [];
    const excludePatterns =
      config?.pathFilters?.filter((p) => p.startsWith('!')).map((p) => p.substring(1)) ?? [];

    const filterConfig: { include?: string[]; exclude?: string[] } = {};
    if (includePatterns.length > 0) {
      filterConfig.include = includePatterns;
    }
    if (excludePatterns.length > 0) {
      filterConfig.exclude = excludePatterns;
    }

    const filteredDiff = filterFiles(parsedDiff, filterConfig);

    logger.debug(
      {
        filteredFiles: filteredDiff.totalFiles,
        originalFiles: parsedDiff.totalFiles,
      },
      'Files filtered'
    );

    // Skip if no files to review
    if (filteredDiff.totalFiles === 0) {
      return {
        comments: [],
        summary: 'No files to review after filtering',
        tokensUsed: 0,
        cost: 0,
      };
    }

    // Chunk the diff if needed
    const chunkedDiff = chunkDiff(filteredDiff);

    logger.debug(
      {
        totalChunks: chunkedDiff.totalChunks,
        strategy: chunkedDiff.strategy,
      },
      'Diff chunked'
    );

    // Generate reviews for each chunk
    const allComments: LocalReviewComment[] = [];
    let totalTokensUsed = 0;
    let summary: string | undefined;

    for (const chunk of chunkedDiff.chunks) {
      const result = await this.reviewChunk(chunk, config);
      allComments.push(...result.comments);
      totalTokensUsed += result.tokensUsed.total;

      // Use the summary from the first (most important) chunk
      if (!summary && result.summary) {
        summary = result.summary;
      }
    }

    // Calculate cost
    const cost = OpenAIProvider.estimateCost(
      { input: totalTokensUsed * 0.7, output: totalTokensUsed * 0.3 },
      config?.aiModel ?? 'gpt-4o'
    );

    const result: {
      comments: LocalReviewComment[];
      summary?: string;
      tokensUsed: number;
      cost: number;
    } = {
      comments: allComments,
      tokensUsed: totalTokensUsed,
      cost,
    };
    if (summary) {
      result.summary = summary;
    }
    return result;
  }

  /**
   * Reviews a single chunk of diff.
   */
  private async reviewChunk(chunk: DiffChunk, config?: ReviewConfig): Promise<OpenAIReviewResult> {
    logger.debug(
      {
        chunkId: chunk.id,
        files: chunk.files.length,
        estimatedTokens: chunk.estimatedTokens,
      },
      'Reviewing chunk'
    );

    const reviewRequest: {
      repositoryId: string;
      pullRequestId: string;
      provider: 'github';
      diff: string;
      config?: ReviewConfig;
    } = {
      repositoryId: '', // Not needed for generation
      pullRequestId: '',
      provider: 'github',
      diff: chunk.content,
    };
    if (config) {
      reviewRequest.config = config;
    }

    return this.aiProvider.generateReview(reviewRequest);
  }

  /**
   * Creates a review record in Strapi.
   */
  private async createReviewRecord(jobData: ReviewJobData): Promise<number> {
    const response = await strapiClient.createReview({
      prNumber: jobData.prNumber,
      prTitle: jobData.prTitle,
      prUrl: jobData.prUrl,
      prAuthor: jobData.prAuthor,
      headSha: jobData.headSha,
      baseSha: jobData.baseSha,
      status: 'pending',
      tokensUsed: 0,
      metadata: {},
      repository: { data: { id: jobData.repositoryId } },
    });

    return response.data.id;
  }

  /**
   * Updates the review status in Strapi.
   */
  private async updateReviewStatus(
    reviewId: number,
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped',
    errorMessage?: string
  ): Promise<void> {
    const updateData: Partial<{
      status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
      errorMessage: string;
    }> = { status };
    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    await strapiClient.updateReview(reviewId, updateData);
  }

  /**
   * Completes a review with results.
   */
  private async completeReview(
    reviewId: number,
    results: { tokensUsed: number; commentsCount: number; summary?: string }
  ): Promise<void> {
    await strapiClient.updateReview(reviewId, {
      status: 'completed',
      tokensUsed: results.tokensUsed,
      completedAt: new Date().toISOString(),
      metadata: {
        commentsCount: results.commentsCount,
        summary: results.summary,
      },
    });
  }

  /**
   * Saves review comments to Strapi.
   */
  private async saveComments(reviewId: number, comments: LocalReviewComment[]): Promise<void> {
    for (const comment of comments) {
      await strapiClient.createReviewComment({
        filePath: comment.file,
        lineStart: comment.line,
        content: comment.message,
        severity: this.mapSeverity(comment.severity),
        category: comment.category,
        isPosted: false,
        review: { data: { id: reviewId } },
      });
    }
  }

  /**
   * Maps severity from AI format to Strapi format.
   */
  private mapSeverity(severity: string): 'info' | 'suggestion' | 'warning' | 'error' {
    const mapping: Record<string, 'info' | 'suggestion' | 'warning' | 'error'> = {
      critical: 'error',
      major: 'warning',
      minor: 'suggestion',
      info: 'info',
    };
    return mapping[severity] ?? 'info';
  }

  /**
   * Posts comments to GitHub PR.
   */
  private async postCommentsToGitHub(
    jobData: ReviewJobData,
    comments: LocalReviewComment[]
  ): Promise<void> {
    if (!this.githubClient || comments.length === 0) {
      return;
    }

    // Extract owner and repo from job data
    // Assuming prUrl is like https://github.com/owner/repo/pull/123
    const match = jobData.prUrl.match(/github\.com\/([^/]+)\/([^/]+)\//);
    if (!match || !match[1] || !match[2]) {
      logger.warn({ prUrl: jobData.prUrl }, 'Could not parse GitHub URL');
      return;
    }

    const owner = match[1];
    const repo = match[2];

    try {
      // Create a review with all comments
      const reviewComments = comments.map((c) => ({
        path: c.file,
        line: c.line,
        body: this.formatGitHubComment(c),
      }));

      await this.githubClient.createReview(
        owner,
        repo,
        jobData.prNumber,
        `AI Code Review completed. Found ${comments.length} comment(s).`,
        'COMMENT',
        reviewComments
      );

      logger.info(
        { owner, repo, prNumber: jobData.prNumber, comments: comments.length },
        'Posted comments to GitHub'
      );
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          prNumber: jobData.prNumber,
        },
        'Failed to post comments to GitHub'
      );
    }
  }

  /**
   * Formats a comment for GitHub.
   */
  private formatGitHubComment(comment: LocalReviewComment): string {
    const severityEmoji: Record<string, string> = {
      critical: '🚨',
      major: '⚠️',
      minor: '💡',
      info: 'ℹ️',
    };

    const categoryBadge = `\`${comment.category}\``;
    const emoji = severityEmoji[comment.severity] ?? 'ℹ️';

    let body = `${emoji} **${comment.severity.toUpperCase()}** ${categoryBadge}\n\n${comment.message}`;

    if (comment.suggestedFix) {
      body += `\n\n**Suggested fix:**\n\`\`\`suggestion\n${comment.suggestedFix}\n\`\`\``;
    }

    return body;
  }

  /**
   * Estimates the cost of reviewing a diff before processing.
   */
  estimateReviewCost(
    diff: string,
    model: string = 'gpt-4o'
  ): {
    files: number;
    chunks: number;
    estimatedTokens: number;
    estimatedCost: number;
  } {
    const parsedDiff = parseDiff(diff);
    const filteredDiff = filterFiles(parsedDiff);
    const chunkedDiff = chunkDiff(filteredDiff);
    const costEstimate = estimateChunksCost(chunkedDiff.chunks, model);

    return {
      files: filteredDiff.totalFiles,
      chunks: chunkedDiff.totalChunks,
      estimatedTokens: costEstimate.inputTokens,
      estimatedCost: costEstimate.estimatedCost,
    };
  }
}

/**
 * Singleton instance for general use.
 */
let reviewServiceInstance: ReviewService | null = null;

export function getReviewService(options?: {
  githubToken?: string;
  openaiApiKey?: string;
  model?: string;
}): ReviewService {
  if (!reviewServiceInstance) {
    reviewServiceInstance = new ReviewService(options);
  }
  return reviewServiceInstance;
}
