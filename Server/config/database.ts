import path from 'path';

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');
  const isProduction = env('NODE_ENV') === 'production';

  // Helper to determine if we should use SSL
  // In production with DATABASE_URL (Render), enable SSL by default
  const shouldUseSSL = () => {
    const explicitSSL = env('DATABASE_SSL');
    if (explicitSSL !== undefined) {
      return env.bool('DATABASE_SSL', false);
    }
    // Auto-enable SSL in production when using DATABASE_URL
    return isProduction && !!env('DATABASE_URL');
  };

  // Build SSL config - Render databases use rejectUnauthorized: false
  const buildSSLConfig = () => {
    if (!shouldUseSSL()) return false;

    // If explicit SSL config is provided, use it
    const hasExplicitConfig = env('DATABASE_SSL_KEY') || env('DATABASE_SSL_CERT') || env('DATABASE_SSL_CA');
    if (hasExplicitConfig) {
      return {
        key: env('DATABASE_SSL_KEY', undefined),
        cert: env('DATABASE_SSL_CERT', undefined),
        ca: env('DATABASE_SSL_CA', undefined),
        capath: env('DATABASE_SSL_CAPATH', undefined),
        cipher: env('DATABASE_SSL_CIPHER', undefined),
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
      };
    }

    // Default SSL config for cloud databases (Render, Heroku, etc.)
    return {
      rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
    };
  };

  const connections = {
    mysql: {
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: buildSSLConfig(),
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    postgres: {
      connection: env('DATABASE_URL')
        ? {
            // Use connection string when available (Render, Heroku, etc.)
            connectionString: env('DATABASE_URL'),
            ssl: buildSSLConfig(),
            schema: env('DATABASE_SCHEMA', 'public'),
          }
        : {
            // Use individual params for local development
            host: env('DATABASE_HOST', 'localhost'),
            port: env.int('DATABASE_PORT', 5432),
            database: env('DATABASE_NAME', 'strapi'),
            user: env('DATABASE_USERNAME', 'strapi'),
            password: env('DATABASE_PASSWORD', 'strapi'),
            ssl: buildSSLConfig(),
            schema: env('DATABASE_SCHEMA', 'public'),
          },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
