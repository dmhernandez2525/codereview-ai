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
 * Sets up default permissions for content types.
 * This runs on bootstrap to ensure permissions are configured.
 */
async function setupDefaultPermissions(strapi: Core.Strapi): Promise<void> {
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
  }
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      // Set up default permissions for content types
      await setupDefaultPermissions(strapi);
    } catch (error) {
      // Log the error but don't fail startup - permissions can be set manually
      strapi.log.error('Bootstrap error during permissions setup:', error);
      strapi.log.warn('Continuing startup without automatic permissions setup. Set permissions manually in admin panel.');
    }
  },
};
