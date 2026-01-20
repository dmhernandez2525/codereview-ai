export default ({ env }) => [
  // Health check must be first to respond before any other middleware
  'global::healthCheck',
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io'],
          'media-src': ["'self'", 'data:', 'blob:'],
          upgradeInsecureRequests: null,
        },
      },
      hsts: {
        enabled: true,
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      xframe: {
        enabled: true,
        value: 'SAMEORIGIN',
      },
      xss: {
        enabled: true,
        mode: 'block',
      },
      xContentTypeOptions: {
        enabled: true,
      },
      referrerPolicy: {
        enabled: true,
        policy: 'strict-origin-when-cross-origin',
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      origin: env('CORS_ORIGINS', '*').split(','),
      maxAge: 86400, // 24 hours
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '256kb',
      jsonLimit: '1mb',
      textLimit: '256kb',
      formidable: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
