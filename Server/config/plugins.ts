export default ({ env }) => ({
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

  // Email configuration (for password reset, notifications)
  email: {
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
  },
});
