/**
 * API Key controller
 * Custom controller for managing encrypted API keys with validation
 */

import { factories } from '@strapi/strapi';

import {
  encryptApiKey,
  decryptApiKey,
  createKeyHint,
  validateKeyFormat,
  testApiKey,
} from '../services/encryption';

import type { Core } from '@strapi/strapi';

interface CreateApiKeyBody {
  provider: 'openai' | 'anthropic' | 'gemini';
  apiKey: string;
}

interface TestApiKeyBody {
  provider: 'openai' | 'anthropic' | 'gemini';
  apiKey: string;
}

export default factories.createCoreController(
  'api::api-key.api-key',
  ({ strapi }: { strapi: Core.Strapi }) => ({
    /**
     * Create a new API key with encryption
     */
    async create(ctx) {
      const { provider, apiKey } = ctx.request.body as CreateApiKeyBody;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('You must be logged in to create an API key');
      }

      if (!provider || !apiKey) {
        return ctx.badRequest('Provider and apiKey are required');
      }

      // Validate key format
      const formatValidation = validateKeyFormat(provider, apiKey);
      if (!formatValidation.valid) {
        return ctx.badRequest(formatValidation.error);
      }

      // Check if user already has a key for this provider
      const existingKey = await strapi.db.query('api::api-key.api-key').findOne({
        where: {
          provider,
          user: user.id,
        },
      });

      if (existingKey) {
        return ctx.badRequest(
          `You already have an API key for ${provider}. Delete it first or update it.`
        );
      }

      // Optionally test the key
      const testResult = await testApiKey(provider, apiKey);

      // Encrypt and store the key
      const encryptedKey = encryptApiKey(apiKey);
      const keyHint = createKeyHint(apiKey);

      const entry = await strapi.db.query('api::api-key.api-key').create({
        data: {
          provider,
          encryptedKey,
          keyHint,
          isValid: testResult.valid,
          lastError: testResult.valid ? null : testResult.error,
          user: user.id,
        },
      });

      // Return sanitized response (without encrypted key)
      return {
        data: {
          id: entry.id,
          provider: entry.provider,
          keyHint: entry.keyHint,
          isValid: entry.isValid,
          lastError: entry.lastError,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        },
        meta: {
          tested: true,
          testResult: testResult.valid ? 'success' : 'failed',
        },
      };
    },

    /**
     * Update an existing API key
     */
    async update(ctx) {
      const { id } = ctx.params;
      const { apiKey } = ctx.request.body as { apiKey?: string };
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('You must be logged in');
      }

      // Verify ownership
      const existingKey = await strapi.db.query('api::api-key.api-key').findOne({
        where: { id },
        populate: ['user'],
      });

      if (!existingKey) {
        return ctx.notFound('API key not found');
      }

      if (existingKey.user?.id !== user.id) {
        return ctx.forbidden('You do not own this API key');
      }

      const updateData: Record<string, unknown> = {};

      // If new API key provided, encrypt it
      if (apiKey) {
        const formatValidation = validateKeyFormat(existingKey.provider, apiKey);
        if (!formatValidation.valid) {
          return ctx.badRequest(formatValidation.error);
        }

        const testResult = await testApiKey(existingKey.provider, apiKey);

        updateData.encryptedKey = encryptApiKey(apiKey);
        updateData.keyHint = createKeyHint(apiKey);
        updateData.isValid = testResult.valid;
        updateData.lastError = testResult.valid ? null : testResult.error;
      }

      const entry = await strapi.db.query('api::api-key.api-key').update({
        where: { id },
        data: updateData,
      });

      return {
        data: {
          id: entry.id,
          provider: entry.provider,
          keyHint: entry.keyHint,
          isValid: entry.isValid,
          lastError: entry.lastError,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        },
      };
    },

    /**
     * Delete an API key
     */
    async delete(ctx) {
      const { id } = ctx.params;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('You must be logged in');
      }

      // Verify ownership
      const existingKey = await strapi.db.query('api::api-key.api-key').findOne({
        where: { id },
        populate: ['user'],
      });

      if (!existingKey) {
        return ctx.notFound('API key not found');
      }

      if (existingKey.user?.id !== user.id) {
        return ctx.forbidden('You do not own this API key');
      }

      await strapi.db.query('api::api-key.api-key').delete({
        where: { id },
      });

      return { data: { id } };
    },

    /**
     * List API keys for the current user
     */
    async find(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('You must be logged in');
      }

      const keys = await strapi.db.query('api::api-key.api-key').findMany({
        where: { user: user.id },
      });

      // Sanitize response - never expose encrypted keys
      return {
        data: keys.map((key) => ({
          id: key.id,
          provider: key.provider,
          keyHint: key.keyHint,
          isValid: key.isValid,
          lastUsedAt: key.lastUsedAt,
          createdAt: key.createdAt,
          updatedAt: key.updatedAt,
        })),
      };
    },

    /**
     * Get a single API key
     */
    async findOne(ctx) {
      const { id } = ctx.params;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('You must be logged in');
      }

      const key = await strapi.db.query('api::api-key.api-key').findOne({
        where: { id },
        populate: ['user'],
      });

      if (!key) {
        return ctx.notFound('API key not found');
      }

      if (key.user?.id !== user.id) {
        return ctx.forbidden('You do not own this API key');
      }

      return {
        data: {
          id: key.id,
          provider: key.provider,
          keyHint: key.keyHint,
          isValid: key.isValid,
          lastUsedAt: key.lastUsedAt,
          lastError: key.lastError,
          createdAt: key.createdAt,
          updatedAt: key.updatedAt,
        },
      };
    },

    /**
     * Validate an API key without storing it
     */
    async validate(ctx) {
      const { provider, apiKey } = ctx.request.body as TestApiKeyBody;

      if (!provider || !apiKey) {
        return ctx.badRequest('Provider and apiKey are required');
      }

      // Validate format first
      const formatValidation = validateKeyFormat(provider, apiKey);
      if (!formatValidation.valid) {
        return {
          valid: false,
          formatValid: false,
          error: formatValidation.error,
        };
      }

      // Test the key against the provider API
      const testResult = await testApiKey(provider, apiKey);

      return {
        valid: testResult.valid,
        formatValid: true,
        error: testResult.error,
      };
    },

    /**
     * Re-test an existing stored API key
     */
    async retest(ctx) {
      const { id } = ctx.params;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('You must be logged in');
      }

      const key = await strapi.db.query('api::api-key.api-key').findOne({
        where: { id },
        populate: ['user'],
      });

      if (!key) {
        return ctx.notFound('API key not found');
      }

      if (key.user?.id !== user.id) {
        return ctx.forbidden('You do not own this API key');
      }

      // Decrypt and test
      const decryptedKey = decryptApiKey(key.encryptedKey);
      const testResult = await testApiKey(key.provider, decryptedKey);

      // Update the key status
      await strapi.db.query('api::api-key.api-key').update({
        where: { id },
        data: {
          isValid: testResult.valid,
          lastError: testResult.valid ? null : testResult.error,
        },
      });

      return {
        valid: testResult.valid,
        error: testResult.error,
      };
    },

    /**
     * Get decrypted API key for internal use (microservice calls)
     * This should only be accessible via internal API token
     */
    async getDecrypted(ctx) {
      const { id } = ctx.params;

      // This endpoint requires API token auth, not user auth
      // The Strapi API token should be configured for microservice access

      const key = await strapi.db.query('api::api-key.api-key').findOne({
        where: { id },
      });

      if (!key) {
        return ctx.notFound('API key not found');
      }

      const decryptedKey = decryptApiKey(key.encryptedKey);

      // Update last used timestamp
      await strapi.db.query('api::api-key.api-key').update({
        where: { id },
        data: { lastUsedAt: new Date() },
      });

      return {
        data: {
          id: key.id,
          provider: key.provider,
          apiKey: decryptedKey,
        },
      };
    },
  })
);
