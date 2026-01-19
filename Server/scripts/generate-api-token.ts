/**
 * API Token Generation Script for CodeReview AI
 *
 * This script generates a Strapi API token for service-to-service communication.
 * Run with: npx ts-node scripts/generate-api-token.ts
 *
 * Environment variables required:
 * - STRAPI_URL: The Strapi server URL (default: http://localhost:1337)
 * - STRAPI_ADMIN_EMAIL: Admin email
 * - STRAPI_ADMIN_PASSWORD: Admin password
 *
 * Usage:
 *   STRAPI_ADMIN_EMAIL=admin@example.com STRAPI_ADMIN_PASSWORD=password npx ts-node scripts/generate-api-token.ts
 */

interface AdminLoginResponse {
  data: {
    token: string;
    user: {
      id: number;
      email: string;
    };
  };
}

interface ApiTokenResponse {
  data: {
    id: number;
    name: string;
    accessKey: string;
    type: string;
  };
}

async function generateApiToken(): Promise<void> {
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
  const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      'Error: STRAPI_ADMIN_EMAIL and STRAPI_ADMIN_PASSWORD environment variables are required'
    );
    console.log('\nUsage:');
    console.log(
      '  STRAPI_ADMIN_EMAIL=admin@example.com STRAPI_ADMIN_PASSWORD=password npx ts-node scripts/generate-api-token.ts'
    );
    process.exit(1);
  }

  console.log(`Connecting to Strapi at ${STRAPI_URL}...`);

  try {
    // Step 1: Login to get admin JWT
    const loginResponse = await fetch(`${STRAPI_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      throw new Error(`Admin login failed: ${error}`);
    }

    const loginData = (await loginResponse.json()) as AdminLoginResponse;
    const adminToken = loginData.data.token;

    console.log(`Logged in as ${loginData.data.user.email}`);

    // Step 2: Create API token
    const tokenName = `microservice-token-${Date.now()}`;
    const tokenResponse = await fetch(`${STRAPI_URL}/admin/api-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: tokenName,
        description: 'API token for Microservice to access Strapi',
        type: 'full-access', // Options: 'read-only', 'full-access', 'custom'
        lifespan: null, // null = never expires, or number of days
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`Failed to create API token: ${error}`);
    }

    const tokenData = (await tokenResponse.json()) as ApiTokenResponse;

    console.log('\n=== API Token Generated Successfully ===');
    console.log(`Name: ${tokenData.data.name}`);
    console.log(`Type: ${tokenData.data.type}`);
    console.log(`\nAccess Key (save this, it won't be shown again):`);
    console.log(`${tokenData.data.accessKey}`);
    console.log('\nAdd this to your Microservice .env file:');
    console.log(`STRAPI_API_TOKEN=${tokenData.data.accessKey}`);
    console.log('=========================================\n');
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

generateApiToken();
