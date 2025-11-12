
/**
 * worker/index.ts
 * BullMQ worker process that consumes jobs.
 * Example processors for 'printers' and 'bulkImport'.
 */

import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import logger from '../src/config/logger';
import prisma from '../src/config/db.config';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const printersWorker = new Worker('printers', async job => {
  if (job.name === 'print-kot') {
    const { kotId } = job.data;
    const kot = await prisma.kOT.findUnique({ where: { id: kotId }});
    if (!kot) throw new Error('KOT not found');
    // In production, forward payload to print-service via HTTP or socket.
    logger.info('Printing KOT', { kotId, payload: kot.payload });
    // mark printed (best-effort)
    await prisma.kOT.update({ where: { id: kotId }, data: { printed: true }});
  }
}, { connection });

const bulkWorker = new Worker('bulkImport', async job => {
  // placeholder: download file, parse CSV/XLSX, validate rows, insert into DB in chunks
  logger.info('bulk job', job.id, job.name);
}, { connection });

logger.info('Workers started');
