import pino from 'pino';

import { config } from '../config/index.js';

const devTransport = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
  },
};

export const logger =
  config.env === 'development'
    ? pino({
        level: 'debug',
        transport: devTransport,
      })
    : pino({
        level: 'info',
      });
