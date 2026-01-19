/**
 * review controller
 *
 * Extended controller with custom endpoints for review analytics.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::review.review', ({ strapi }) => ({
  /**
   * Get recent reviews across all repositories.
   * GET /api/reviews/recent
   *
   * Query params:
   * - limit: number of reviews to return (default: 10)
   * - organizationId: filter by organization (optional)
   */
  async recent(ctx) {
    const { limit = 10, organizationId } = ctx.query;

    const whereClause: Record<string, unknown> = {};

    if (organizationId) {
      // Need to filter by repository's organization
      const repositories = await strapi.db.query('api::repository.repository').findMany({
        where: { organization: organizationId },
        select: ['id'],
      });
      const repoIds = repositories.map((r) => r.id);
      whereClause.repository = { id: { $in: repoIds } };
    }

    const reviews = await strapi.db.query('api::review.review').findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      limit: Number(limit),
      populate: ['repository', 'comments'],
    });

    // Add comment count to each review
    const reviewsWithCounts = reviews.map((review) => ({
      ...review,
      commentCount: Array.isArray(review.comments) ? review.comments.length : 0,
      comments: undefined, // Don't include full comment data
    }));

    return {
      data: reviewsWithCounts,
    };
  },

  /**
   * Get analytics for a repository's reviews.
   * GET /api/reviews/analytics/:repositoryId
   *
   * Query params:
   * - startDate: ISO date string (optional)
   * - endDate: ISO date string (optional)
   */
  async analytics(ctx) {
    const { repositoryId } = ctx.params;
    const { startDate, endDate } = ctx.query;

    // Verify repository exists
    const repository = await strapi.entityService.findOne(
      'api::repository.repository',
      repositoryId
    );
    if (!repository) {
      return ctx.notFound('Repository not found');
    }

    // Build date filter
    const dateFilter: Record<string, unknown> = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate as string);
    }

    const whereClause: Record<string, unknown> = { repository: repositoryId };
    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter;
    }

    // Get all reviews in the period
    const reviews = await strapi.db.query('api::review.review').findMany({
      where: whereClause,
      select: ['id', 'status', 'tokensUsed', 'processingTime', 'createdAt', 'completedAt'],
    });

    // Calculate analytics
    const statusCounts = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      failed: 0,
      skipped: 0,
    };

    let totalTokens = 0;
    let totalProcessingTime = 0;
    let completedCount = 0;

    for (const review of reviews) {
      statusCounts[review.status as keyof typeof statusCounts]++;
      totalTokens += review.tokensUsed || 0;
      if (review.processingTime) {
        totalProcessingTime += review.processingTime;
        completedCount++;
      }
    }

    // Get comment statistics
    const reviewIds = reviews.map((r) => r.id);
    let commentStats = {
      total: 0,
      bySeverity: { info: 0, suggestion: 0, warning: 0, error: 0 },
      byCategory: {} as Record<string, number>,
    };

    if (reviewIds.length > 0) {
      const comments = await strapi.db.query('api::review-comment.review-comment').findMany({
        where: { review: { id: { $in: reviewIds } } },
        select: ['severity', 'category'],
      });

      commentStats.total = comments.length;
      for (const comment of comments) {
        if (comment.severity) {
          commentStats.bySeverity[comment.severity as keyof typeof commentStats.bySeverity]++;
        }
        if (comment.category) {
          commentStats.byCategory[comment.category] =
            (commentStats.byCategory[comment.category] || 0) + 1;
        }
      }
    }

    return {
      data: {
        period: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
        reviews: {
          total: reviews.length,
          ...statusCounts,
          successRate:
            reviews.length > 0
              ? Math.round((statusCounts.completed / reviews.length) * 100)
              : 0,
        },
        performance: {
          totalTokens,
          averageTokens: reviews.length > 0 ? Math.round(totalTokens / reviews.length) : 0,
          averageProcessingTime:
            completedCount > 0 ? Math.round(totalProcessingTime / completedCount) : 0,
        },
        comments: commentStats,
      },
    };
  },

  /**
   * Get timeline data for charts.
   * GET /api/reviews/timeline/:repositoryId
   *
   * Query params:
   * - days: number of days to look back (default: 30)
   * - groupBy: 'day' | 'week' | 'month' (default: 'day')
   */
  async timeline(ctx) {
    const { repositoryId } = ctx.params;
    const { days = 30, groupBy = 'day' } = ctx.query;

    // Verify repository exists
    const repository = await strapi.entityService.findOne(
      'api::repository.repository',
      repositoryId
    );
    if (!repository) {
      return ctx.notFound('Repository not found');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const reviews = await strapi.db.query('api::review.review').findMany({
      where: {
        repository: repositoryId,
        createdAt: { $gte: startDate },
      },
      select: ['id', 'status', 'tokensUsed', 'createdAt'],
      orderBy: { createdAt: 'asc' },
    });

    // Group reviews by time period
    const grouped = new Map<string, { count: number; tokens: number; completed: number }>();

    for (const review of reviews) {
      const date = new Date(review.createdAt);
      let key: string;

      if (groupBy === 'week') {
        // Get start of week
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek;
        const weekStart = new Date(date.setDate(diff));
        key = weekStart.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = date.toISOString().split('T')[0];
      }

      const current = grouped.get(key) || { count: 0, tokens: 0, completed: 0 };
      current.count++;
      current.tokens += review.tokensUsed || 0;
      if (review.status === 'completed') {
        current.completed++;
      }
      grouped.set(key, current);
    }

    // Convert to array
    const timeline = Array.from(grouped.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));

    return {
      data: {
        groupBy,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        timeline,
      },
    };
  },

  /**
   * Get a review with all its comments.
   * GET /api/reviews/:id/full
   */
  async full(ctx) {
    const { id } = ctx.params;

    const review = await strapi.entityService.findOne('api::review.review', id, {
      populate: ['repository', 'comments'],
    });

    if (!review) {
      return ctx.notFound('Review not found');
    }

    // Group comments by file
    const commentsByFile: Record<string, unknown[]> = {};
    if (Array.isArray(review.comments)) {
      for (const comment of review.comments) {
        const filePath = (comment as { filePath: string }).filePath;
        if (!commentsByFile[filePath]) {
          commentsByFile[filePath] = [];
        }
        commentsByFile[filePath].push(comment);
      }
    }

    return {
      data: {
        ...review,
        commentsByFile,
      },
    };
  },
}));
