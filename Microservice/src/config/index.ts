import 'dotenv/config';

const env = process.env;

export const config = {
  env: env['NODE_ENV'] ?? 'development',
  port: parseInt(env['PORT'] ?? '4000', 10),

  strapi: {
    url: env['STRAPI_URL'] ?? 'http://localhost:1337',
    apiToken: env['STRAPI_API_TOKEN'] ?? '',
  },

  redis: {
    host: env['REDIS_HOST'] ?? 'localhost',
    port: parseInt(env['REDIS_PORT'] ?? '6379', 10),
  },

  ai: {
    openai: {
      apiKey: env['OPENAI_API_KEY'] ?? '',
    },
    anthropic: {
      apiKey: env['ANTHROPIC_API_KEY'] ?? '',
    },
    google: {
      apiKey: env['GOOGLE_AI_API_KEY'] ?? '',
    },
  },

  github: {
    appId: env['GITHUB_APP_ID'] ?? '',
    privateKey: env['GITHUB_APP_PRIVATE_KEY'] ?? '',
    webhookSecret: env['GITHUB_WEBHOOK_SECRET'] ?? '',
  },

  gitlab: {
    webhookSecret: env['GITLAB_WEBHOOK_SECRET'] ?? '',
  },

  bitbucket: {
    webhookSecret: env['BITBUCKET_WEBHOOK_SECRET'] ?? '',
  },

  azure: {
    webhookSecret: env['AZURE_DEVOPS_WEBHOOK_SECRET'] ?? '',
  },

  encryption: {
    // Secret key for encrypting/decrypting BYOK API keys
    secretKey: env['ENCRYPTION_SECRET_KEY'] ?? 'default-dev-key-change-in-production',
  },
} as const;

export type Config = typeof config;
