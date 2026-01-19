/**
 * Health check middleware for Render and other deployment platforms.
 * Responds to /_health with a 200 OK status.
 */
export default () => {
  return async (ctx, next) => {
    if (ctx.path === '/_health') {
      ctx.status = 200;
      ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
      return;
    }
    await next();
  };
};
