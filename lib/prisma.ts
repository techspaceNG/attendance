import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Prisma Client singleton for Next.js hot reloading
export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
