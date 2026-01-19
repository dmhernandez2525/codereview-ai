import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { config } from './config/index.js';
import {
  webhookSignatureMiddleware,
  handleWebhook,
  getGitHubOAuth,
} from './integrations/github/index.js';
import { getReviewQueue, getQueueStats, closeQueues, startReviewWorker } from './lib/queue.js';
import { getRedisClient, isRedisConnected, closeRedisConnection } from './lib/redis.js';
import { strapiClient } from './lib/strapi.js';
import { parseConfig, getDefaultConfig, validateConfig } from './services/config-parser.js';
import { createReviewProcessor } from './services/review-processor.js';
import { logger } from './utils/logger.js';

import type { HealthResponse } from './types/index.js';

const app = express();
const startTime = Date.now();

// Initialize connections
async function initializeConnections(): Promise<void> {
  logger.info('Initializing connections...');

  // Initialize Redis connection
  getRedisClient();

  // Initialize the review queue (will connect to Redis)
  getReviewQueue();

  // Start the review worker
  const reviewProcessor = createReviewProcessor();
  startReviewWorker(reviewProcessor);

  // Test Strapi connection
  await strapiClient.testConnection();

  logger.info('Connections initialized');
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Incoming request');
  next();
});

// Health check endpoint
app.get('/api/v1/health', async (_req, res) => {
  const queueStats = await getQueueStats().catch(() => ({
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
  }));

  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services: {
      redis: isRedisConnected() ? 'connected' : 'disconnected',
      strapi: strapiClient.isConnected() ? 'connected' : 'disconnected',
    },
  };

  // Add queue stats to response
  const extendedResponse = {
    ...response,
    queue: queueStats,
  };

  res.json(extendedResponse);
});

// Ready check endpoint
app.get('/api/v1/ready', (_req, res) => {
  res.json({ ready: true });
});

// GitHub webhook endpoint
app.post('/api/v1/webhooks/github', webhookSignatureMiddleware, (req, res) => {
  const event = req.headers['x-github-event'] as string;

  handleWebhook(event, req.body)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      logger.error(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Webhook processing failed'
      );
      res.status(500).json({ error: 'Webhook processing failed' });
    });
});

// =========================================================================
// GitHub OAuth Endpoints
// =========================================================================

// List all GitHub App installations
app.get('/api/v1/github/installations', async (_req, res) => {
  try {
    const oauth = getGitHubOAuth();
    const installations = await oauth.listInstallations();
    res.json({ data: installations });
  } catch (error) {
    logger.error({ error }, 'Failed to list installations');
    res.status(500).json({ error: 'Failed to list installations' });
  }
});

// Get repositories for an installation
app.get('/api/v1/github/installations/:installationId/repositories', async (req, res) => {
  try {
    const installationId = parseInt(req.params.installationId, 10);
    if (isNaN(installationId)) {
      res.status(400).json({ error: 'Invalid installation ID' });
      return;
    }

    const oauth = getGitHubOAuth();
    const repositories = await oauth.listInstallationRepositories(installationId);
    res.json({ data: repositories });
  } catch (error) {
    logger.error({ error }, 'Failed to list installation repositories');
    res.status(500).json({ error: 'Failed to list repositories' });
  }
});

// Get installation details
app.get('/api/v1/github/installations/:installationId', async (req, res) => {
  try {
    const installationId = parseInt(req.params.installationId, 10);
    if (isNaN(installationId)) {
      res.status(400).json({ error: 'Invalid installation ID' });
      return;
    }

    const oauth = getGitHubOAuth();
    const installation = await oauth.getInstallation(installationId);
    res.json({ data: installation });
  } catch (error) {
    logger.error({ error }, 'Failed to get installation');
    res.status(500).json({ error: 'Failed to get installation' });
  }
});

// =========================================================================
// Configuration Endpoints
// =========================================================================

// Parse and validate a .codereview.yaml config
app.post('/api/v1/config/validate', (req, res) => {
  const { yaml: yamlContent } = req.body as { yaml?: string };

  if (!yamlContent || typeof yamlContent !== 'string') {
    res.status(400).json({ error: 'Missing or invalid yaml content' });
    return;
  }

  const result = parseConfig(yamlContent);
  res.json(result);
});

// Get default configuration
app.get('/api/v1/config/defaults', (_req, res) => {
  res.json({ config: getDefaultConfig() });
});

// Validate a config object (already parsed JSON)
app.post('/api/v1/config/validate-object', (req, res) => {
  const { config: configObject } = req.body as { config?: unknown };

  if (!configObject || typeof configObject !== 'object') {
    res.status(400).json({ error: 'Missing or invalid config object' });
    return;
  }

  const result = validateConfig(configObject);
  res.json(result);
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ error: err.message, stack: err.stack }, 'Unhandled error');
  res.status(500).json({
    error: config.env === 'production' ? 'Internal Server Error' : err.message,
  });
});

// Start server
const server = app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.env }, 'Microservice started');

  // Initialize connections after server starts
  initializeConnections().catch((error) => {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to initialize connections'
    );
    // Don't exit - the service can still accept requests, connections will retry
  });
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down gracefully...');

  // Async cleanup wrapped in Promise
  const cleanup = async () => {
    // Close queues first (stops accepting new jobs)
    try {
      await closeQueues();
    } catch (error) {
      logger.error(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Error closing queues'
      );
    }

    // Close Redis connection
    try {
      await closeRedisConnection();
    } catch (error) {
      logger.error(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Error closing Redis'
      );
    }
  };

  cleanup()
    .then(() => {
      // Close HTTP server
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    })
    .catch((error) => {
      logger.error(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Error during cleanup'
      );
      process.exit(1);
    });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { app };
