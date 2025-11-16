import { config } from "dotenv";
import { getTursoClient } from "../src/lib/turso";

// Load environment variables from .env
config();

async function migrate() {
  console.log("Starting migration: Adding order field to applications table...");
  
  try {
    const client = getTursoClient();
    
    // Check if the column already exists (idempotent migration)
    const tableInfo = await client.execute("PRAGMA table_info(applications)");
    const hasOrderColumn = tableInfo.rows.some((row: any) => row.name === "order");
    
    if (hasOrderColumn) {
      console.log("✓ Order column already exists. Skipping migration.");
      return;
    }
    
    // Add the new column with default value
    await client.execute(`
      ALTER TABLE applications 
      ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0
    `);
    
    console.log("✓ Added 'order' column to applications table");
    
    // Create index on the new column
    await client.execute(`
      CREATE INDEX IF NOT EXISTS applications_order_idx 
      ON applications("order")
    `);
    
    console.log("✓ Created index on 'order' column");
    
    // Set initial order values based on current created_at order
    await client.execute(`
      UPDATE applications 
      SET "order" = (
        SELECT COUNT(*) 
        FROM applications AS a2 
        WHERE a2.created_at <= applications.created_at
      )
    `);
    
    console.log("✓ Set initial order values based on creation date");
    
    console.log("\n✅ Migration completed successfully!");
    console.log("All applications now have order values set.");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();

