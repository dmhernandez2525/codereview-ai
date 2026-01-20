export default ({ env }) => {
  const isProduction = env('NODE_ENV') === 'production';

  // Build email config only if email provider is configured
  const emailProvider = env('EMAIL_PROVIDER');
  const smtpHost = env('SMTP_HOST');
  const hasEmailConfig = emailProvider || smtpHost;

  // Base plugins config - minimal required configuration
  // All plugins are configured with safe defaults that work in cloud environments
  const plugins: Record<string, unknown> = {
    // Users & Permissions plugin configuration
    // This is a core plugin required for authentication
    'users-permissions': {
      enabled: true,
      config: {
        jwt: {
          expiresIn: env('JWT_EXPIRY', '7d'), // Longer lived tokens for better UX
        },
        register: {
          allowedFields: ['username', 'email', 'password'],
        },
        // Rate limiting is optional - disable if causing issues
        ratelimit: {
          enabled: env.bool('RATE_LIMIT_ENABLED', !isProduction), // Disabled in prod by default
          interval: 60000, // 1 minute
          max: 100, // Max 100 requests per minute per IP
        },
      },
    },
  };

  // Only configure email plugin if email settings are provided
  // This prevents startup failures when email is not configured
  if (hasEmailConfig) {
    plugins.email = {
      enabled: true,
      config: {
        provider: env('EMAIL_PROVIDER', 'sendmail'),
        providerOptions: {
          host: env('SMTP_HOST', 'localhost'),
          port: env.int('SMTP_PORT', 587),
          auth: {
            user: env('SMTP_USER'),
            pass: env('SMTP_PASS'),
          },
        },
        settings: {
          defaultFrom: env('EMAIL_FROM', 'noreply@codereview-ai.com'),
          defaultReplyTo: env('EMAIL_REPLY_TO', 'support@codereview-ai.com'),
        },
      },
    };
  } else if (!isProduction) {
    // In development, use sendmail as fallback
    plugins.email = {
      enabled: true,
      config: {
        provider: 'sendmail',
        settings: {
          defaultFrom: 'noreply@codereview-ai.com',
          defaultReplyTo: 'support@codereview-ai.com',
        },
      },
    };
  }
  // In production without email config, don't configure email at all
  // This allows Strapi to start without email functionality

  return plugins;
};
