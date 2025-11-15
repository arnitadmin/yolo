import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // For local development, use file-based SQLite
  if (process.env.NODE_ENV === "development" && !process.env.DATABASE_URL?.startsWith("libsql://")) {
    return new PrismaClient();
  }

  // For production with Turso, use libSQL adapter
  if (process.env.DATABASE_URL && process.env.DATABASE_AUTH_TOKEN) {
    const libsql = createClient({
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });

    // @ts-expect-error - PrismaLibSQL type mismatch with libsql client
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter } as any);
  }

  // Fallback to standard Prisma client
  return new PrismaClient();
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

