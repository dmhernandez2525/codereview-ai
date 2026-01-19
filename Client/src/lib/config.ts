/**
 * Client configuration
 * Provides type-safe access to environment variables
 */

function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? '';
}

/**
 * Public configuration (available in browser)
 */
export const config = {
  /** Strapi API URL */
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL'),

  /** Microservice URL */
  microserviceUrl: getEnvVar('NEXT_PUBLIC_MICROSERVICE_URL'),

  /** App URL (for OAuth callbacks) */
  appUrl: getEnvVar('NEXT_PUBLIC_APP_URL'),

  /** GitHub OAuth Client ID */
  githubClientId: getEnvVar('NEXT_PUBLIC_GITHUB_CLIENT_ID', false),

  /** Whether in development mode */
  isDev: process.env.NODE_ENV === 'development',

  /** Whether in production mode */
  isProd: process.env.NODE_ENV === 'production',
} as const;

/**
 * Server-only configuration
 * These should only be accessed in server components or API routes
 */
export const serverConfig = {
  /** GitHub OAuth Client Secret */
  githubClientSecret: getEnvVar('GITHUB_CLIENT_SECRET', false),

  /** Strapi API Token */
  strapiApiToken: getEnvVar('STRAPI_API_TOKEN', false),
} as const;
