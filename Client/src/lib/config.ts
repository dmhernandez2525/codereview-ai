/**
 * Client configuration
 * Provides type-safe access to environment variables
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    // Only throw at runtime in the browser, not during build
    if (typeof window !== 'undefined') {
      console.warn(`Missing environment variable: ${key}`);
    }
  }
  return value ?? defaultValue ?? '';
}

/**
 * Public configuration (available in browser)
 */
export const config = {
  /** Strapi API URL */
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:1337'),

  /** Microservice URL */
  microserviceUrl: getEnvVar('NEXT_PUBLIC_MICROSERVICE_URL', 'http://localhost:4000'),

  /** App URL (for OAuth callbacks) */
  appUrl: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),

  /** GitHub OAuth Client ID */
  githubClientId: getEnvVar('NEXT_PUBLIC_GITHUB_CLIENT_ID', ''),

  /** Whether demo mode is enabled (shows demo data without auth) */
  demoMode: getEnvVar('NEXT_PUBLIC_DEMO_MODE', 'false') === 'true',

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
  githubClientSecret: getEnvVar('GITHUB_CLIENT_SECRET', ''),

  /** Strapi API Token */
  strapiApiToken: getEnvVar('STRAPI_API_TOKEN', ''),
} as const;
