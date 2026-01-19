export default ({ env }) => ({
  // Users & Permissions plugin configuration
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d', // JWT token expiry
      },
      register: {
        allowedFields: ['username', 'email', 'password'],
      },
    },
  },
});
