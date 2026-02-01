#!/usr/bin/env node
/**
 * Startup wrapper for Strapi with enhanced error logging.
 * This script helps diagnose startup issues on cloud platforms like Render.
 */

const { spawn } = require('child_process');
const path = require('path');

// Log startup configuration
console.log('=== Strapi Startup Configuration ===');
console.log('Timestamp:', new Date().toISOString());
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('HOST:', process.env.HOST || '0.0.0.0');
console.log('PORT:', process.env.PORT || '1337');
console.log('DATABASE_CLIENT:', process.env.DATABASE_CLIENT || 'sqlite');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[SET]' : '[NOT SET]');
console.log('DATABASE_SSL:', process.env.DATABASE_SSL || '[NOT SET]');
console.log('APP_KEYS:', process.env.APP_KEYS ? '[SET]' : '[NOT SET]');
console.log('ADMIN_JWT_SECRET:', process.env.ADMIN_JWT_SECRET ? '[SET]' : '[NOT SET]');
console.log('API_TOKEN_SALT:', process.env.API_TOKEN_SALT ? '[SET]' : '[NOT SET]');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[SET]' : '[NOT SET]');
console.log('TRANSFER_TOKEN_SALT:', process.env.TRANSFER_TOKEN_SALT ? '[SET]' : '[NOT SET]');
console.log('====================================');

// Validate required environment variables (warn only, don't exit)
const requiredEnvVars = ['APP_KEYS', 'ADMIN_JWT_SECRET', 'API_TOKEN_SALT', 'TRANSFER_TOKEN_SALT'];

const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.warn('WARNING: Missing environment variables:', missingVars.join(', '));
  console.warn('These may be required by Strapi. Please verify your configuration.');
}

// Check database configuration (warn only)
if (process.env.DATABASE_CLIENT === 'postgres' && !process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_CLIENT is postgres but DATABASE_URL is not set');
}

console.log('Starting Strapi...');
console.log('Working directory:', path.resolve(__dirname, '..'));
console.log('====================================');

// Use spawn instead of execSync for better output handling
const strapi = spawn('npx', ['strapi', 'start'], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  env: process.env,
});

strapi.on('error', (error) => {
  console.error('=== STRAPI SPAWN ERROR ===');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  console.error('==========================');
  process.exit(1);
});

strapi.on('close', (code) => {
  console.log('=== STRAPI PROCESS ENDED ===');
  console.log('Exit code:', code);
  console.log('Timestamp:', new Date().toISOString());
  console.log('============================');
  process.exit(code || 0);
});
