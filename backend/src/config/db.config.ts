
/**
 * prisma client wrapper — central place to import Prisma client.
 * You can add prisma middlewares here (auditing, tenant enforcement).
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
