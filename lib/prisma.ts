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
  const raw = process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL;

  // Supabase's pooler presents a cert chain that Node's default CA bundle
  // doesn't trust. The connection string ships with `sslmode=require` which
  // forces full verification — we downgrade it to `no-verify` so the
  // connection is still TLS-encrypted but skips CA validation. This is the
  // documented Supabase + serverless pattern.
  const connectionString = raw
    ? raw.replace(/sslmode=require/g, "sslmode=no-verify")
    : raw;

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
