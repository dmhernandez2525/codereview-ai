/**
 * API Key routes
 * Custom routes for API key management
 */

export default {
  routes: [
    // Standard CRUD routes (with custom controller implementations)
    {
      method: 'GET',
      path: '/api-keys',
      handler: 'api-key.find',
      config: {
        policies: [],
        middlewares: [],
        description: 'List all API keys for the current user',
        tag: {
          name: 'API Keys',
          plugin: 'users-permissions',
        },
      },
    },
    {
      method: 'GET',
      path: '/api-keys/:id',
      handler: 'api-key.findOne',
      config: {
        policies: [],
        middlewares: [],
        description: 'Get a single API key',
        tag: {
          name: 'API Keys',
          plugin: 'users-permissions',
        },
      },
    },
    {
      method: 'POST',
      path: '/api-keys',
      handler: 'api-key.create',
      config: {
        policies: [],
        middlewares: [],
        description: 'Create a new API key',
        tag: {
          name: 'API Keys',
          plugin: 'users-permissions',
        },
      },
    },
    {
      method: 'PUT',
      path: '/api-keys/:id',
      handler: 'api-key.update',
      config: {
        policies: [],
        middlewares: [],
        description: 'Update an API key',
        tag: {
          name: 'API Keys',
          plugin: 'users-permissions',
        },
      },
    },
    {
      method: 'DELETE',
      path: '/api-keys/:id',
      handler: 'api-key.delete',
      config: {
        policies: [],
        middlewares: [],
        description: 'Delete an API key',
        tag: {
          name: 'API Keys',
          plugin: 'users-permissions',
        },
      },
    },
    // Custom routes
    {
      method: 'POST',
      path: '/api-keys/validate',
      handler: 'api-key.validate',
      config: {
        policies: [],
        middlewares: [],
        auth: false, // Public endpoint for validating keys before signup
        description: 'Validate an API key without storing it',
        tag: {
          name: 'API Keys',
          plugin: 'users-permissions',
        },
      },
    },
    {
      method: 'POST',
      path: '/api-keys/:id/retest',
      handler: 'api-key.retest',
      config: {
        policies: [],
        middlewares: [],
        description: 'Re-test an existing API key',
        tag: {
          name: 'API Keys',
          plugin: 'users-permissions',
        },
      },
    },
    {
      method: 'GET',
      path: '/api-keys/:id/decrypted',
      handler: 'api-key.getDecrypted',
      config: {
        policies: [],
        middlewares: [],
        description: 'Get decrypted API key (internal use only)',
        tag: {
          name: 'API Keys - Internal',
          plugin: 'users-permissions',
        },
      },
    },
  ],
};
