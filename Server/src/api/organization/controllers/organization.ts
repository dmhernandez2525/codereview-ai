/**
 * organization controller
 *
 * Extended controller with custom endpoints for organization analytics.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::organization.organization', ({ strapi }) => ({
  /**
   * Get organization dashboard data.
   * GET /api/organizations/:id/dashboard
   *
   * Returns a summary of organization statistics for the dashboard.
   */
  async dashboard(ctx) {
    const { id } = ctx.params;

    // Verify organization exists
    const organization = await strapi.entityService.findOne('api::organization.organization', id);
    if (!organization) {
      return ctx.notFound('Organization not found');
    }

    // Get all repositories for this organization
    const repositories = await strapi.db.query('api::repository.repository').findMany({
      where: { organization: id },
      select: ['id', 'name', 'isActive'],
    });

    const repoIds = repositories.map((r) => r.id);

    // Get review statistics
    const [totalReviews, completedReviews, failedReviews, pendingReviews] = await Promise.all([
      strapi.db.query('api::review.review').count({
        where: { repository: { id: { $in: repoIds } } },
      }),
      strapi.db.query('api::review.review').count({
        where: { repository: { id: { $in: repoIds } }, status: 'completed' },
      }),
      strapi.db.query('api::review.review').count({
        where: { repository: { id: { $in: repoIds } }, status: 'failed' },
      }),
      strapi.db.query('api::review.review').count({
        where: {
          repository: { id: { $in: repoIds } },
          status: { $in: ['pending', 'in_progress'] },
        },
      }),
    ]);

    // Get usage statistics for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usageLogs = await strapi.db.query('api::usage-log.usage-log').findMany({
      where: {
        organization: id,
        createdAt: { $gte: startOfMonth },
      },
      select: ['tokensInput', 'tokensOutput', 'costEstimate'],
    });

    let monthlyTokens = 0;
    let monthlyCost = 0;
    for (const log of usageLogs) {
      monthlyTokens += (log.tokensInput || 0) + (log.tokensOutput || 0);
      monthlyCost += Number(log.costEstimate) || 0;
    }

    // Get recent reviews
    const recentReviews = await strapi.db.query('api::review.review').findMany({
      where: { repository: { id: { $in: repoIds } } },
      orderBy: { createdAt: 'desc' },
      limit: 5,
      populate: ['repository'],
    });

    return {
      data: {
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        },
        repositories: {
          total: repositories.length,
          active: repositories.filter((r) => r.isActive).length,
        },
        reviews: {
          total: totalReviews,
          completed: completedReviews,
          failed: failedReviews,
          pending: pendingReviews,
          successRate: totalReviews > 0 ? Math.round((completedReviews / totalReviews) * 100) : 0,
        },
        usage: {
          monthlyTokens,
          monthlyCost: Math.round(monthlyCost * 100) / 100,
        },
        recentReviews: recentReviews.map((r) => ({
          id: r.id,
          prNumber: r.prNumber,
          prTitle: r.prTitle,
          status: r.status,
          createdAt: r.createdAt,
          repository: r.repository
            ? { id: r.repository.id, name: r.repository.name }
            : null,
        })),
      },
    };
  },

  /**
   * Get organization usage statistics.
   * GET /api/organizations/:id/usage
   *
   * Query params:
   * - startDate: ISO date string (optional, defaults to start of current month)
   * - endDate: ISO date string (optional, defaults to now)
   */
  async usage(ctx) {
    const { id } = ctx.params;
    let { startDate, endDate } = ctx.query;

    // Verify organization exists
    const organization = await strapi.entityService.findOne('api::organization.organization', id);
    if (!organization) {
      return ctx.notFound('Organization not found');
    }

    // Default to current month
    if (!startDate) {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      startDate = start.toISOString();
    }
    if (!endDate) {
      endDate = new Date().toISOString();
    }

    // Get usage logs
    const usageLogs = await strapi.db.query('api::usage-log.usage-log').findMany({
      where: {
        organization: id,
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
      },
      populate: ['repository'],
    });

    // Aggregate by model
    const byModel: Record<string, { requests: number; tokens: number; cost: number }> = {};
    // Aggregate by repository
    const byRepository: Record<string, { requests: number; tokens: number; cost: number }> = {};
    // Aggregate by day
    const byDay: Record<string, { requests: number; tokens: number; cost: number }> = {};

    for (const log of usageLogs) {
      const tokens = (log.tokensInput || 0) + (log.tokensOutput || 0);
      const cost = Number(log.costEstimate) || 0;

      // By model
      const model = log.model || 'unknown';
      if (!byModel[model]) {
        byModel[model] = { requests: 0, tokens: 0, cost: 0 };
      }
      byModel[model].requests++;
      byModel[model].tokens += tokens;
      byModel[model].cost += cost;

      // By repository
      const repoName = log.repository?.name || 'unknown';
      if (!byRepository[repoName]) {
        byRepository[repoName] = { requests: 0, tokens: 0, cost: 0 };
      }
      byRepository[repoName].requests++;
      byRepository[repoName].tokens += tokens;
      byRepository[repoName].cost += cost;

      // By day
      const day = new Date(log.createdAt).toISOString().split('T')[0];
      if (!byDay[day]) {
        byDay[day] = { requests: 0, tokens: 0, cost: 0 };
      }
      byDay[day].requests++;
      byDay[day].tokens += tokens;
      byDay[day].cost += cost;
    }

    // Calculate totals
    let totalTokens = 0;
    let totalCost = 0;
    for (const model of Object.values(byModel)) {
      totalTokens += model.tokens;
      totalCost += model.cost;
    }

    return {
      data: {
        period: {
          startDate,
          endDate,
        },
        totals: {
          requests: usageLogs.length,
          tokens: totalTokens,
          cost: Math.round(totalCost * 100) / 100,
        },
        byModel: Object.entries(byModel).map(([model, data]) => ({
          model,
          ...data,
          cost: Math.round(data.cost * 100) / 100,
        })),
        byRepository: Object.entries(byRepository).map(([repository, data]) => ({
          repository,
          ...data,
          cost: Math.round(data.cost * 100) / 100,
        })),
        byDay: Object.entries(byDay)
          .map(([date, data]) => ({
            date,
            ...data,
            cost: Math.round(data.cost * 100) / 100,
          }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      },
    };
  },
}));
