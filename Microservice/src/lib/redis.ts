import Redis from 'ioredis';

import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let redisClient: Redis | null = null;
let isConnected = false;

/**
 * Creates and returns a Redis client instance.
 * Reuses existing connection if already established.
 */
export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: true,
    retryStrategy: (times) => {
      if (times > 10) {
        logger.error('Redis connection failed after 10 retries');
        return null; // Stop retrying
      }
      const delay = Math.min(times * 100, 3000);
      logger.warn({ attempt: times, delay }, 'Retrying Redis connection');
      return delay;
    },
  });

  redisClient.on('connect', () => {
    logger.info('Redis connecting...');
  });

  redisClient.on('ready', () => {
    isConnected = true;
    logger.info({ host: config.redis.host, port: config.redis.port }, 'Redis connected');
  });

  redisClient.on('error', (err) => {
    isConnected = false;
    logger.error({ error: err.message }, 'Redis error');
  });

  redisClient.on('close', () => {
    isConnected = false;
    logger.info('Redis connection closed');
  });

  return redisClient;
}

/**
 * Returns the current Redis connection status.
 */
export function isRedisConnected(): boolean {
  return isConnected;
}

/**
 * Gracefully closes the Redis connection.
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isConnected = false;
    logger.info('Redis connection closed gracefully');
  }
}
