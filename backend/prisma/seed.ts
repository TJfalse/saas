
/**
 * seed.ts
 * Sample demo seed for local development.
 * Run with: ts-node prisma/seed.ts (after prisma generate and migrate)
 */

import prisma from '../src/config/db.config';
import bcrypt from 'bcrypt';

async function main(){
  const pass = await bcrypt.hash('admin123', 10);
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Cafe',
      domain: 'demo.local',
      branches: { create: [{ name: 'Main Branch' }] },
      users: { create: [{ email: 'owner@demo.com', password: pass, role: 'OWNER' }] }
    }
  });
  console.log('Seeded', tenant.id);
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
