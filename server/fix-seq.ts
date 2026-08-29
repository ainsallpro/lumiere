import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function fixSeq() {
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Product"', 'id'), coalesce(max(id), 0) + 1, false) FROM "Product";`);
  console.log("Sequence fixed!");
}
fixSeq().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
