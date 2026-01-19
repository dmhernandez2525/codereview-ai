/**
 * repository router
 *
 * Custom routes for repository management endpoints.
 */

export default {
  routes: [
    // Custom: Get repositories by organization with stats
    {
      method: 'GET',
      path: '/repositories/by-organization/:organizationId',
      handler: 'repository.byOrganization',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom: Get repository statistics
    {
      method: 'GET',
      path: '/repositories/:id/stats',
      handler: 'repository.stats',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom: Get active configuration for repository
    {
      method: 'GET',
      path: '/repositories/:id/config',
      handler: 'repository.getConfig',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom: Toggle repository active state
    {
      method: 'PUT',
      path: '/repositories/:id/toggle',
      handler: 'repository.toggle',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Default CRUD routes
    {
      method: 'GET',
      path: '/repositories',
      handler: 'repository.find',
    },
    {
      method: 'GET',
      path: '/repositories/:id',
      handler: 'repository.findOne',
    },
    {
      method: 'POST',
      path: '/repositories',
      handler: 'repository.create',
    },
    {
      method: 'PUT',
      path: '/repositories/:id',
      handler: 'repository.update',
    },
    {
      method: 'DELETE',
      path: '/repositories/:id',
      handler: 'repository.delete',
    },
  ],
};
