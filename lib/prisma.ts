// Prisma client for database operations
// Currently using in-memory storage (memoryStore.ts)
// This can be enabled when database is configured

declare global {
  // allow global prisma during hot-reload in development
  // eslint-disable-next-line no-var
  var prisma: any | undefined;
}

let prisma: any = undefined;

try {
  if (process.env.DATABASE_URL) {
    const { PrismaClient } = require('@prisma/client');
    prisma = global.prisma ?? new PrismaClient();
    if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
  }
} catch (e) {
  // Prisma not available - using in-memory storage
  console.log('Prisma not configured, using in-memory storage');
}

export default prisma;
