import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient, type Client } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;
  
  console.log("[DB] DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
  console.log("[DB] TURSO_DATABASE_URL:", process.env.TURSO_DATABASE_URL ? "SET" : "NOT SET");
  console.log("[DB] DATABASE_AUTH_TOKEN:", process.env.DATABASE_AUTH_TOKEN ? "SET" : "NOT SET");
  console.log("[DB] TURSO_AUTH_TOKEN:", process.env.TURSO_AUTH_TOKEN ? "SET" : "NOT SET");
  console.log("[DB] Final dbUrl:", dbUrl ? "SET" : "NOT SET");
  console.log("[DB] Final authToken:", authToken ? "SET" : "NOT SET");
  
  // For Turso with libSQL, use the adapter
  if (dbUrl?.startsWith("libsql://") && authToken) {
    const libsql: Client = createClient({
      url: dbUrl,
      authToken: authToken,
    });

    const adapter = new PrismaLibSQL(libsql as any);
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

