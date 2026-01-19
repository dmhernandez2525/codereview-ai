import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { config } from './config/index.js';
import { logger } from './utils/logger.js';

import type { HealthResponse } from './types/index.js';

const app = express();
const startTime = Date.now();

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
app.get('/api/v1/health', (_req, res) => {
  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services: {
      redis: 'disconnected', // Will be updated when Redis is connected
      strapi: 'disconnected', // Will be updated when Strapi is connected
    },
  };
  res.json(response);
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
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { app };
