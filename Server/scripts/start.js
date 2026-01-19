#!/usr/bin/env node
/**
 * Startup wrapper for Strapi with enhanced error logging.
 * This script helps diagnose startup issues on cloud platforms like Render.
 */

const { execSync } = require('child_process');
const path = require('path');

// Log startup configuration
console.log('=== Strapi Startup Configuration ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('HOST:', process.env.HOST || '0.0.0.0');
console.log('PORT:', process.env.PORT || '1337');
console.log('DATABASE_CLIENT:', process.env.DATABASE_CLIENT || 'sqlite');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[SET]' : '[NOT SET]');
console.log('APP_KEYS:', process.env.APP_KEYS ? '[SET]' : '[NOT SET]');
console.log('ADMIN_JWT_SECRET:', process.env.ADMIN_JWT_SECRET ? '[SET]' : '[NOT SET]');
console.log('API_TOKEN_SALT:', process.env.API_TOKEN_SALT ? '[SET]' : '[NOT SET]');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[SET]' : '[NOT SET]');
console.log('TRANSFER_TOKEN_SALT:', process.env.TRANSFER_TOKEN_SALT ? '[SET]' : '[NOT SET]');
console.log('====================================');

// Validate required environment variables
const requiredEnvVars = [
  'APP_KEYS',
  'ADMIN_JWT_SECRET',
  'API_TOKEN_SALT',
  'JWT_SECRET',
  'TRANSFER_TOKEN_SALT',
];

const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error('ERROR: Missing required environment variables:', missingVars.join(', '));
  console.error('Please set these variables in your Render service configuration.');
  process.exit(1);
}

// Check database configuration
if (process.env.DATABASE_CLIENT === 'postgres' && !process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_CLIENT is postgres but DATABASE_URL is not set');
  process.exit(1);
}

console.log('Starting Strapi...');
console.log('Working directory:', path.resolve(__dirname, '..'));

// Use execSync with inherit to properly pass through all output
try {
  execSync('npx strapi start', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
  });
} catch (error) {
  console.error('=== STRAPI STARTUP ERROR ===');
  console.error('Exit status:', error.status);
  if (error.stderr) {
    console.error('stderr:', error.stderr.toString());
  }
  console.error('============================');
  process.exit(error.status || 1);
}
