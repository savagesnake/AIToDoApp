import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function createPrismaClient() {
  // Prisma 7 talks to Postgres through a driver adapter (node-postgres here)
  // instead of a bundled query engine. The app uses Neon's *pooled* URL.
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

// In development, Next.js hot reload re-evaluates this module on every change.
// Caching the client on globalThis stops each reload from opening a new pool.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
