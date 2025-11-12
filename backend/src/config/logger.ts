
/**
 * logger.ts
 * pino or simple logger wrapper. Replace with pino in production.
 */
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { pid: false }
});

export default logger;
