import type { Core } from '@strapi/strapi';

/**
 * Permission configuration for CodeReview AI content types.
 * Defines which roles can perform which actions on each content type.
 */
const PERMISSIONS_CONFIG = {
  // Authenticated users can read most resources
  authenticated: {
    'api::organization.organization': ['find', 'findOne'],
    'api::repository.repository': ['find', 'findOne'],
    'api::review.review': ['find', 'findOne'],
    'api::review-comment.review-comment': ['find', 'findOne'],
    'api::api-key.api-key': ['find', 'findOne', 'create', 'update', 'delete'],
    'api::configuration.configuration': ['find', 'findOne'],
    'api::usage-log.usage-log': ['find', 'findOne'],
  },
  // Public role has no access to API content types
  public: {},
};

/**
 * Log startup environment for debugging cloud deployments
 */
function logStartupEnvironment(strapi: Core.Strapi): void {
  const env = process.env;
  strapi.log.info('=== Strapi Startup Environment ===');
  strapi.log.info(`NODE_ENV: ${env.NODE_ENV || 'not set'}`);
  strapi.log.info(`HOST: ${env.HOST || 'not set'}`);
  strapi.log.info(`PORT: ${env.PORT || 'not set'}`);
  strapi.log.info(`DATABASE_CLIENT: ${env.DATABASE_CLIENT || 'not set'}`);
  strapi.log.info(`DATABASE_URL: ${env.DATABASE_URL ? '[CONFIGURED]' : 'not set'}`);
  strapi.log.info(`DATABASE_SSL: ${env.DATABASE_SSL || 'not set'}`);
  strapi.log.info(`APP_KEYS: ${env.APP_KEYS ? '[CONFIGURED]' : 'not set'}`);
  strapi.log.info(`ADMIN_JWT_SECRET: ${env.ADMIN_JWT_SECRET ? '[CONFIGURED]' : 'not set'}`);
  strapi.log.info(`API_TOKEN_SALT: ${env.API_TOKEN_SALT ? '[CONFIGURED]' : 'not set'}`);
  strapi.log.info('=================================');
}

/**
 * Verify database connection is working
 */
async function verifyDatabaseConnection(strapi: Core.Strapi): Promise<boolean> {
  strapi.log.info('Verifying database connection...');
  try {
    // Try a simple database query to verify connection
    // This uses the Strapi query engine which handles connection pooling
    const result = await strapi.db?.connection.raw('SELECT 1 as test');
    if (result) {
      strapi.log.info('Database connection verified successfully');
      return true;
    }
    strapi.log.warn('Database connection returned empty result');
    return false;
  } catch (error) {
    strapi.log.error('Database connection verification failed:', error);
    return false;
  }
}

/**
 * Sets up default permissions for content types.
 * This runs on bootstrap to ensure permissions are configured.
 */
async function setupDefaultPermissions(strapi: Core.Strapi): Promise<void> {
  // Skip permissions setup if users-permissions plugin is not available
  if (!strapi.plugin('users-permissions')) {
    strapi.log.warn('Users-permissions plugin not available, skipping permissions setup');
    return;
  }

  const pluginStore = strapi.store({
    type: 'plugin',
    name: 'users-permissions',
  });

  // Check if permissions have already been initialized
  const initialized = await pluginStore.get({ key: 'codereview_permissions_initialized' });
  if (initialized) {
    strapi.log.info('Permissions already initialized, skipping...');
    return;
  }

  strapi.log.info('Setting up default permissions for CodeReview AI...');

  try {
    // Get the roles
    const roles = await strapi.query('plugin::users-permissions.role').findMany({
      where: { type: { $in: ['authenticated', 'public'] } },
    });

    for (const role of roles) {
      const roleType = role.type as 'authenticated' | 'public';
      const permissions = PERMISSIONS_CONFIG[roleType];

      if (!permissions) continue;

      for (const [contentType, actions] of Object.entries(permissions)) {
        for (const action of actions) {
          // Check if permission already exists
          const existingPermission = await strapi
            .query('plugin::users-permissions.permission')
            .findOne({
              where: {
                role: role.id,
                action: `${contentType}.${action}`,
              },
            });

          if (!existingPermission) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                role: role.id,
                action: `${contentType}.${action}`,
              },
            });
            strapi.log.debug(`Created permission: ${role.type} - ${contentType}.${action}`);
          }
        }
      }
    }

    // Mark as initialized
    await pluginStore.set({ key: 'codereview_permissions_initialized', value: true });
    strapi.log.info('Default permissions setup complete.');
  } catch (error) {
    strapi.log.error('Failed to setup default permissions:', error);
    // Don't re-throw - this is non-critical
  }
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // Log environment info early for debugging
    strapi.log.info('Strapi register phase starting...');
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.log.info('Strapi bootstrap phase starting...');

    // Log startup environment for debugging
    logStartupEnvironment(strapi);

    try {
      // Verify database connection first
      const dbConnected = await verifyDatabaseConnection(strapi);
      if (!dbConnected) {
        strapi.log.warn('Database connection could not be verified, but continuing startup...');
      }

      // Set up default permissions for content types
      // This is wrapped in try-catch and non-critical
      await setupDefaultPermissions(strapi);

      strapi.log.info('Bootstrap completed successfully');
    } catch (error) {
      // Log the error but don't fail startup - permissions can be set manually
      strapi.log.error('Bootstrap error:', error);
      strapi.log.warn('Continuing startup despite bootstrap errors. Some features may need manual configuration.');
    }
  },
};
