/**
 * configuration router
 */

// Custom routes for validation and defaults
export default {
  routes: [
    // Custom validation endpoint
    {
      method: 'POST',
      path: '/configurations/validate',
      handler: 'configuration.validate',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom defaults endpoint
    {
      method: 'GET',
      path: '/configurations/defaults',
      handler: 'configuration.defaults',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Default CRUD routes
    {
      method: 'GET',
      path: '/configurations',
      handler: 'configuration.find',
    },
    {
      method: 'GET',
      path: '/configurations/:id',
      handler: 'configuration.findOne',
    },
    {
      method: 'POST',
      path: '/configurations',
      handler: 'configuration.create',
    },
    {
      method: 'PUT',
      path: '/configurations/:id',
      handler: 'configuration.update',
    },
    {
      method: 'DELETE',
      path: '/configurations/:id',
      handler: 'configuration.delete',
    },
  ],
};
