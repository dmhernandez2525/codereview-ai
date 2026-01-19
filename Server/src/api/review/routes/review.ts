/**
 * review router
 *
 * Custom routes for review analytics endpoints.
 */

export default {
  routes: [
    // Custom: Get recent reviews
    {
      method: 'GET',
      path: '/reviews/recent',
      handler: 'review.recent',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom: Get analytics for repository
    {
      method: 'GET',
      path: '/reviews/analytics/:repositoryId',
      handler: 'review.analytics',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom: Get timeline data for repository
    {
      method: 'GET',
      path: '/reviews/timeline/:repositoryId',
      handler: 'review.timeline',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom: Get review with full details
    {
      method: 'GET',
      path: '/reviews/:id/full',
      handler: 'review.full',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Default CRUD routes
    {
      method: 'GET',
      path: '/reviews',
      handler: 'review.find',
    },
    {
      method: 'GET',
      path: '/reviews/:id',
      handler: 'review.findOne',
    },
    {
      method: 'POST',
      path: '/reviews',
      handler: 'review.create',
    },
    {
      method: 'PUT',
      path: '/reviews/:id',
      handler: 'review.update',
    },
    {
      method: 'DELETE',
      path: '/reviews/:id',
      handler: 'review.delete',
    },
  ],
};
