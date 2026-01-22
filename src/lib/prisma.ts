import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Lazy initialization with error handling
function createPrismaClient(): PrismaClient {
  const isDev = process.env.NODE_ENV === 'development';
  
  return new PrismaClient({
    // Only log errors in dev, no query logging to avoid build slowdowns
    log: isDev ? ['error'] : ['error', 'warn'],
  });
}

// Use singleton pattern to prevent multiple instances
// Explicitly type the export to ensure TypeScript sees all models
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

