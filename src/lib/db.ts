import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  
  // For Turso with libSQL, use the adapter
  if (dbUrl?.startsWith("libsql://") && authToken) {
    const libsql = createClient({
      url: dbUrl,
      authToken: authToken,
    });

    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter } as any);
  }

  // For local development with file-based SQLite
  if (dbUrl?.startsWith("file:")) {
    return new PrismaClient();
  }

  // Fallback to standard Prisma client (uses schema default: file:./dev.db)
  return new PrismaClient();
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

