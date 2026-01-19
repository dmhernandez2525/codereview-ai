/**
 * repository controller
 *
 * Extended controller with custom endpoints for repository management.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::repository.repository', ({ strapi }) => ({
  /**
   * Get statistics for a specific repository.
   * GET /api/repositories/:id/stats
   *
   * Returns counts of reviews by status, token usage, and other metrics.
   */
  async stats(ctx) {
    const { id } = ctx.params;

    // Verify repository exists
    const repository = await strapi.entityService.findOne('api::repository.repository', id);
    if (!repository) {
      return ctx.notFound('Repository not found');
    }

    // Get review counts by status
    const [pending, inProgress, completed, failed, skipped] = await Promise.all([
      strapi.db.query('api::review.review').count({
        where: { repository: id, status: 'pending' },
      }),
      strapi.db.query('api::review.review').count({
        where: { repository: id, status: 'in_progress' },
      }),
      strapi.db.query('api::review.review').count({
        where: { repository: id, status: 'completed' },
      }),
      strapi.db.query('api::review.review').count({
        where: { repository: id, status: 'failed' },
      }),
      strapi.db.query('api::review.review').count({
        where: { repository: id, status: 'skipped' },
      }),
    ]);

    // Get total tokens used
    const reviews = await strapi.db.query('api::review.review').findMany({
      where: { repository: id },
      select: ['tokensUsed'],
    });
    const totalTokens = reviews.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);

    // Get comment counts by severity
    const reviewIds = reviews.map((r) => r.id);
    const [infoComments, suggestionComments, warningComments, errorComments] = await Promise.all([
      strapi.db.query('api::review-comment.review-comment').count({
        where: { review: { id: { $in: reviewIds } }, severity: 'info' },
      }),
      strapi.db.query('api::review-comment.review-comment').count({
        where: { review: { id: { $in: reviewIds } }, severity: 'suggestion' },
      }),
      strapi.db.query('api::review-comment.review-comment').count({
        where: { review: { id: { $in: reviewIds } }, severity: 'warning' },
      }),
      strapi.db.query('api::review-comment.review-comment').count({
        where: { review: { id: { $in: reviewIds } }, severity: 'error' },
      }),
    ]);

    return {
      data: {
        reviews: {
          total: pending + inProgress + completed + failed + skipped,
          pending,
          inProgress,
          completed,
          failed,
          skipped,
        },
        tokens: {
          total: totalTokens,
        },
        comments: {
          total: infoComments + suggestionComments + warningComments + errorComments,
          info: infoComments,
          suggestion: suggestionComments,
          warning: warningComments,
          error: errorComments,
        },
      },
    };
  },

  /**
   * Get the active configuration for a repository.
   * GET /api/repositories/:id/config
   *
   * Returns the most recent valid configuration for the repository.
   */
  async getConfig(ctx) {
    const { id } = ctx.params;

    // Verify repository exists
    const repository = await strapi.entityService.findOne('api::repository.repository', id);
    if (!repository) {
      return ctx.notFound('Repository not found');
    }

    // Get the most recent valid configuration
    const configurations = await strapi.db.query('api::configuration.configuration').findMany({
      where: {
        repository: id,
        isValid: true,
      },
      orderBy: { createdAt: 'desc' },
      limit: 1,
      populate: ['repository'],
    });

    if (configurations.length === 0) {
      // Return default config if none exists
      const { getDefaultConfig } = await import(
        '../../configuration/services/config-validator'
      );
      return {
        data: {
          isDefault: true,
          config: getDefaultConfig(),
        },
      };
    }

    return {
      data: {
        isDefault: false,
        config: configurations[0],
      },
    };
  },

  /**
   * Toggle repository active state.
   * PUT /api/repositories/:id/toggle
   *
   * Toggles the isActive flag on a repository.
   */
  async toggle(ctx) {
    const { id } = ctx.params;

    // Verify repository exists
    const repository = await strapi.entityService.findOne('api::repository.repository', id);
    if (!repository) {
      return ctx.notFound('Repository not found');
    }

    // Toggle the active state using db query for flexibility
    const updated = await strapi.db.query('api::repository.repository').update({
      where: { id },
      data: {
        isActive: !repository.isActive,
      },
    });

    return {
      data: updated,
    };
  },

  /**
   * Get all repositories for an organization with stats.
   * GET /api/repositories/by-organization/:organizationId
   *
   * Returns repositories with basic stats for the dashboard.
   */
  async byOrganization(ctx) {
    const { organizationId } = ctx.params;
    const { page = 1, pageSize = 25, sort = 'createdAt:desc' } = ctx.query;

    // Verify organization exists
    const organization = await strapi.entityService.findOne(
      'api::organization.organization',
      organizationId
    );
    if (!organization) {
      return ctx.notFound('Organization not found');
    }

    // Parse sort parameter
    const [sortField, sortOrder] = (sort as string).split(':');

    // Get repositories
    const [repositories, total] = await Promise.all([
      strapi.db.query('api::repository.repository').findMany({
        where: { organization: organizationId },
        orderBy: { [sortField]: sortOrder || 'desc' },
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize),
      }),
      strapi.db.query('api::repository.repository').count({
        where: { organization: organizationId },
      }),
    ]);

    // Get basic stats for each repository
    const repositoriesWithStats = await Promise.all(
      repositories.map(async (repo) => {
        const [reviewCount, completedReviews, lastReview] = await Promise.all([
          strapi.db.query('api::review.review').count({
            where: { repository: repo.id },
          }),
          strapi.db.query('api::review.review').count({
            where: { repository: repo.id, status: 'completed' },
          }),
          strapi.db.query('api::review.review').findMany({
            where: { repository: repo.id },
            orderBy: { createdAt: 'desc' },
            limit: 1,
            select: ['createdAt', 'status'],
          }),
        ]);

        return {
          ...repo,
          stats: {
            totalReviews: reviewCount,
            completedReviews,
            lastReviewAt: lastReview[0]?.createdAt || null,
            lastReviewStatus: lastReview[0]?.status || null,
          },
        };
      })
    );

    return {
      data: repositoriesWithStats,
      meta: {
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          pageCount: Math.ceil(total / Number(pageSize)),
          total,
        },
      },
    };
  },
}));
