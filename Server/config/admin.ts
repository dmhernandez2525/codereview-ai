export default ({ env }) => {
  const config: Record<string, unknown> = {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    apiToken: {
      salt: env('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT'),
      },
    },
    flags: {
      nps: env.bool('FLAG_NPS', false), // Disable by default in cloud deployments
      promoteEE: env.bool('FLAG_PROMOTE_EE', false), // Disable EE promotion
    },
  };

  // Only add encryption key if provided - it's optional
  const encryptionKey = env('ENCRYPTION_KEY');
  if (encryptionKey) {
    config.secrets = {
      encryptionKey,
    };
  }

  return config;
};
