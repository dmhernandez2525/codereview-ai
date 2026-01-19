import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { config } from './config/index.js';
import { getReviewQueue, getQueueStats, closeQueues } from './lib/queue.js';
import { getRedisClient, isRedisConnected, closeRedisConnection } from './lib/redis.js';
import { strapiClient } from './lib/strapi.js';
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
