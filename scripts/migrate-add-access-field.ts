import { config } from "dotenv";
import { getTursoClient } from "../src/lib/turso";

// Load environment variables
config();

async function migrate() {
  console.log("Starting migration: Adding access field to applications table...");
  
  try {
    const client = getTursoClient();
    
    // Check if the column already exists
    const tableInfo = await client.execute("PRAGMA table_info(applications)");
    const hasAccessColumn = tableInfo.rows.some((row: any) => row.name === "access");
    
    if (hasAccessColumn) {
      console.log("✓ Access column already exists. Skipping migration.");
      return;
    }
    
    // Add the access column with default value
    await client.execute(`
      ALTER TABLE applications 
      ADD COLUMN access TEXT NOT NULL DEFAULT 'user'
    `);
    
    console.log("✓ Added 'access' column to applications table");
    
    // Create index on access column
    await client.execute(`
      CREATE INDEX IF NOT EXISTS applications_access_idx 
      ON applications(access)
    `);
    
    console.log("✓ Created index on 'access' column");
    
    console.log("\n✅ Migration completed successfully!");
    console.log("All existing applications now have access level set to 'user' by default.");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();

