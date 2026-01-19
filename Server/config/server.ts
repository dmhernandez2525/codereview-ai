export default ({ env }) => {
  // Handle APP_KEYS - can be a single key or comma-separated keys
  // Render generates a single key, so we ensure it's always an array
  const getAppKeys = () => {
    const keys = env('APP_KEYS');
    if (!keys) {
      throw new Error('APP_KEYS environment variable is required');
    }
    // If it's already comma-separated, split it; otherwise return as single-item array
    const keyArray = keys.includes(',') ? keys.split(',') : [keys];
    return keyArray.map((k: string) => k.trim()).filter((k: string) => k.length > 0);
  };

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    app: {
      keys: getAppKeys(),
    },
  };
};
