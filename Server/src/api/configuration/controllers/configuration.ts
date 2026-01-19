/**
 * configuration controller
 */

import { factories } from '@strapi/strapi';

import {
  validateYamlConfig,
  validateJsonConfig,
  getDefaultConfig,
} from '../services/config-validator';

export default factories.createCoreController('api::configuration.configuration', ({ strapi }) => ({
  /**
   * Validates a YAML or JSON configuration.
   * POST /api/configurations/validate
   *
   * Request body:
   * {
   *   "yaml": "string" // YAML content
   * }
   * or
   * {
   *   "json": {} // JSON config object
   * }
   */
  async validate(ctx) {
    const { yaml, json } = ctx.request.body;

    if (!yaml && !json) {
      return ctx.badRequest('Either yaml or json content is required');
    }

    if (yaml && json) {
      return ctx.badRequest('Provide either yaml or json, not both');
    }

    let result;
    if (yaml) {
      if (typeof yaml !== 'string') {
        return ctx.badRequest('yaml must be a string');
      }
      result = validateYamlConfig(yaml);
    } else {
      result = validateJsonConfig(json);
    }

    return {
      data: {
        valid: result.valid,
        errors: result.errors,
        config: result.valid ? result.merged : null,
      },
    };
  },

  /**
   * Returns the default configuration.
   * GET /api/configurations/defaults
   */
  async defaults(ctx) {
    return {
      data: getDefaultConfig(),
    };
  },

  /**
   * Creates a configuration with validation.
   * Overrides the default create to add validation.
   */
  async create(ctx) {
    const { yamlContent, ...rest } = ctx.request.body.data || {};

    if (!yamlContent) {
      return ctx.badRequest('yamlContent is required');
    }

    // Validate the YAML content
    const result = validateYamlConfig(yamlContent);

    if (!result.valid) {
      return ctx.badRequest('Invalid configuration', {
        errors: result.errors,
      });
    }

    // Add parsed and validation data
    ctx.request.body.data = {
      ...rest,
      yamlContent,
      parsed: result.merged,
      isValid: true,
      validationErrors: null,
    };

    // Call the default create
    const response = await super.create(ctx);
    return response;
  },

  /**
   * Updates a configuration with validation.
   * Overrides the default update to add validation.
   */
  async update(ctx) {
    const { yamlContent, ...rest } = ctx.request.body.data || {};

    if (yamlContent) {
      // Validate the YAML content if provided
      const result = validateYamlConfig(yamlContent);

      if (!result.valid) {
        return ctx.badRequest('Invalid configuration', {
          errors: result.errors,
        });
      }

      // Add parsed and validation data
      ctx.request.body.data = {
        ...rest,
        yamlContent,
        parsed: result.merged,
        isValid: true,
        validationErrors: null,
      };
    }

    // Call the default update
    const response = await super.update(ctx);
    return response;
  },
}));
