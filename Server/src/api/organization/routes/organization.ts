/**
 * organization router
 *
 * Custom routes for organization dashboard and usage endpoints.
 */

export default {
  routes: [
    // Custom: Get organization dashboard data
    {
      method: 'GET',
      path: '/organizations/:id/dashboard',
      handler: 'organization.dashboard',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom: Get organization usage statistics
    {
      method: 'GET',
      path: '/organizations/:id/usage',
      handler: 'organization.usage',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Default CRUD routes
    {
      method: 'GET',
      path: '/organizations',
      handler: 'organization.find',
    },
    {
      method: 'GET',
      path: '/organizations/:id',
      handler: 'organization.findOne',
    },
    {
      method: 'POST',
      path: '/organizations',
      handler: 'organization.create',
    },
    {
      method: 'PUT',
      path: '/organizations/:id',
      handler: 'organization.update',
    },
    {
      method: 'DELETE',
      path: '/organizations/:id',
      handler: 'organization.delete',
    },
  ],
};
