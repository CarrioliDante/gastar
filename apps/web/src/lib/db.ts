import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

function createPrismaClient() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL!,
    min: 1,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,   // generous for Supabase cold starts
    maxLifetimeSeconds: 60 * 5,        // recycle connections before PgBouncer drops them
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
  });

  pool.on("error", (err) => {
    // Prevent crash from idle-client errors — the pool will replace the bad connection
    console.error("pg pool unexpected error:", err.message);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter, log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
