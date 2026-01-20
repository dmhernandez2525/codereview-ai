import type { Core } from '@strapi/strapi';

/**
 * Health check middleware for Render deployments.
 * Responds with 200 OK on /_health endpoint.
 */
export default (_config: unknown, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    if (ctx.path === '/_health') {
      ctx.status = 200;
      ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
      return;
    }
    await next();
  };
};
