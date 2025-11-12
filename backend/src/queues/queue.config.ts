/**
 * queue.config.ts
 * Small helper to create and return BullMQ queues.
 * For production, configure Redis connection pooling and separate connections per environment.
 */

import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(
  process.env.REDIS_URL || "redis://localhost:6379"
);

const queues: Record<string, Queue> = {};

export function getQueue(name: string) {
  if (!queues[name]) {
    queues[name] = new Queue(name, { connection });
  }
  return queues[name];
}

export async function initQueues() {
  // Warm up common queues
  getQueue("printers");
  getQueue("bulkImport");
  getQueue("reports");
  return;
}
