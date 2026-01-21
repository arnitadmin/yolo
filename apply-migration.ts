import { createClient } from "@libsql/client";
import * as fs from "fs";

const client = createClient({
  url: "libsql://turso-yolo-vercel-icfg-8jgmnirdo402fb0kkdtjrmcs.aws-ap-south-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjMyMDkyNzYsImlkIjoiZDNiOGJhNTItZjFiOC00Mjg1LTk2MGEtZmJmMjg4MWRiOTVmIiwicmlkIjoiM2FlZTI3NzItY2YzNy00ODVmLTkwMTctNTAyOTAzN2ZkNTNkIn0.ItmTTlTjlfC61IR0F8p2Dqf5SiyrxaPSotBGxUBBMSzvdXAdaeB73_sj9UAHnjwqJZ1F-msTaCDN4ah5Z6YIDA",
});

async function applyMigration() {
  try {
    // Check if contents table exists
    const checkTable = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='contents'"
    );
    
    if (checkTable.rows.length > 0) {
      console.log("✅ Contents table already exists!");
      return;
    }

    console.log("Creating contents table...");

    // Create the contents table
    await client.execute(`
      CREATE TABLE "contents" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "slug" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "markdown" TEXT NOT NULL,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL
      )
    `);

    // Create unique index
    await client.execute(`
      CREATE UNIQUE INDEX "contents_slug_key" ON "contents"("slug")
    `);

    console.log("✅ Migration applied successfully!");
  } catch (error) {
    console.error("Error applying migration:", error);
  }
}

applyMigration();
