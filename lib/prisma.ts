import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Next.js dev mode hot-reloads on every save. Without this global cache,
// each reload would create a new PrismaClient and leak Postgres connections.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // The Supabase ↔ Vercel integration injects POSTGRES_PRISMA_URL automatically
  // (pooled, port 6543). Local dev uses DATABASE_URL from .env. Prefer the
  // Vercel-injected name in prod, fall back to DATABASE_URL locally.
  const connectionString =
    process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
