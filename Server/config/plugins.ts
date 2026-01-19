export default ({ env }) => {
  const isProduction = env('NODE_ENV') === 'production';
  const isStrapiCloud = env.bool('STRAPI_CLOUD', false);

  // Build email config only if email provider is configured
  const emailProvider = env('EMAIL_PROVIDER');
  const smtpHost = env('SMTP_HOST');
  const hasEmailConfig = emailProvider || smtpHost;

  // Base plugins config
  const plugins: Record<string, unknown> = {
    // Users & Permissions plugin configuration
    'users-permissions': {
      config: {
        jwt: {
          expiresIn: env('JWT_EXPIRY', '1h'), // Short-lived JWT tokens (1 hour default)
        },
        register: {
          allowedFields: ['username', 'email', 'password'],
        },
        ratelimit: {
          enabled: true,
          interval: 60000, // 1 minute
          max: 100, // Max 100 requests per minute per IP
        },
      },
    },
  };

  // Disable cloud plugin for self-hosted deployments (Render, etc.)
  // The cloud plugin is only needed for Strapi Cloud deployments
  if (!isStrapiCloud) {
    plugins.cloud = {
      enabled: false,
    };
  }

  // Only configure email plugin if email settings are provided
  // This prevents startup failures when email is not configured
  if (hasEmailConfig) {
    plugins.email = {
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
      config: {
        provider: 'sendmail',
        settings: {
          defaultFrom: 'noreply@codereview-ai.com',
          defaultReplyTo: 'support@codereview-ai.com',
        },
      },
    };
  }
  // In production without email config, let Strapi use its defaults

  return plugins;
};
