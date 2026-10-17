import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

export function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient();
  }

  // Prevent multiple instances in development / hot reload
  if (!global.__prismaClient) {
    global.__prismaClient = new PrismaClient({
      log: process.env.DEBUG_PRISMA === 'true' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  return global.__prismaClient;
}

export const prisma = getPrismaClient();
