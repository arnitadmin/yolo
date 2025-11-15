# Database Migration Guide for YOLO

This guide documents the migration process for the YOLO application, which uses Turso (libSQL) as its database provider managed through Vercel.

## Overview

YOLO uses a hybrid database setup:
- **Turso (libSQL)** for production database (managed via Vercel)
- **Prisma** for schema definition only (not for migrations)
- **Direct SQL migrations** via custom TypeScript scripts

## Why This Approach?

Since the database is managed by Vercel and accessed via the Turso libSQL client directly (not through Prisma ORM), we cannot use Prisma's standard migration tools (`prisma migrate dev` or `prisma migrate deploy`). Instead, we use custom migration scripts that execute SQL directly against the Turso database.

## Migration Process

### Step 1: Update Prisma Schema

First, update the schema definition in `prisma/schema.prisma`:

```prisma
model Application {
  id                   Int      @id @default(autoincrement())
  name                 String
  // ... other fields ...
  access               String   @default("user") // NEW FIELD
  
  @@index([access]) // NEW INDEX
  @@map("applications")
}
```

### Step 2: Update TypeScript Types

Update the corresponding TypeScript types in `src/types/index.ts`:

```typescript
// Update Zod schema for validation
export const applicationSchema = z.object({
  // ... other fields ...
  access: z.enum(["user", "admin"]).default("user"),
});

// Update TypeScript interface
export interface Application {
  // ... other fields ...
  access: string;
}
```

### Step 3: Create Migration Script

Create a new migration script in `scripts/` directory:

**File: `scripts/migrate-add-access-field.ts`**

```typescript
import { config } from "dotenv";
import { getTursoClient } from "../src/lib/turso";

// Load environment variables from .env
config();

async function migrate() {
  console.log("Starting migration: Adding access field to applications table...");
  
  try {
    const client = getTursoClient();
    
    // Check if the column already exists (idempotent migration)
    const tableInfo = await client.execute("PRAGMA table_info(applications)");
    const hasAccessColumn = tableInfo.rows.some((row: any) => row.name === "access");
    
    if (hasAccessColumn) {
      console.log("✓ Access column already exists. Skipping migration.");
      return;
    }
    
    // Add the new column with default value
    await client.execute(`
      ALTER TABLE applications 
      ADD COLUMN access TEXT NOT NULL DEFAULT 'user'
    `);
    
    console.log("✓ Added 'access' column to applications table");
    
    // Create index on the new column
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
```

### Step 4: Add Migration Command to package.json

Add a script to run the migration easily:

```json
{
  "scripts": {
    "migrate:access": "tsx scripts/migrate-add-access-field.ts"
  }
}
```

### Step 5: Run the Migration

Execute the migration script:

```bash
pnpm migrate:access
```

**Expected Output:**
```
Starting migration: Adding access field to applications table...
✓ Added 'access' column to applications table
✓ Created index on 'access' column

✅ Migration completed successfully!
All existing applications now have access level set to 'user' by default.
```

## Key Requirements for Migration Scripts

### 1. Load Environment Variables

Always load environment variables at the top of your migration script:

```typescript
import { config } from "dotenv";
config();
```

This ensures `DATABASE_URL` and `DATABASE_AUTH_TOKEN` are available.

### 2. Make Migrations Idempotent

Check if changes already exist before applying them:

```typescript
// Check if column exists
const tableInfo = await client.execute("PRAGMA table_info(table_name)");
const hasColumn = tableInfo.rows.some((row: any) => row.name === "column_name");

if (hasColumn) {
  console.log("Column already exists. Skipping migration.");
  return;
}
```

### 3. Use SQLite Syntax

Since Turso uses libSQL (SQLite-compatible), use SQLite syntax:

```sql
-- Add column with default
ALTER TABLE table_name ADD COLUMN column_name TEXT NOT NULL DEFAULT 'value';

-- Create index
CREATE INDEX IF NOT EXISTS index_name ON table_name(column_name);

-- Check table structure
PRAGMA table_info(table_name);
```

### 4. Handle Errors Gracefully

Always wrap migration logic in try-catch and exit with error code on failure:

```typescript
try {
  // migration logic
} catch (error) {
  console.error("❌ Migration failed:", error);
  process.exit(1);
}
```

## Update Application Code

After running the migration, update your application code to use the new field:

### Update Database Helpers (`src/lib/turso.ts`)

```typescript
// Update mapper function
function mapRowToApplication(row: any): Application {
  return {
    // ... other fields ...
    access: row.access as string,
  };
}

// Update create function
async createApplication(data: {
  // ... other fields ...
  access?: string;
}) {
  const result = await client.execute({
    sql: `INSERT INTO applications (..., access, ...) VALUES (..., ?, ...)`,
    args: [..., data.access || "user", ...],
  });
}

// Update update function
async updateApplication(id: number, data: Partial<{
  // ... other fields ...
  access: string;
}>) {
  // ... add access to update logic
  if (data.access !== undefined) { 
    updates.push("access = ?"); 
    args.push(data.access); 
  }
}
```

## Rollback Strategy

If you need to rollback a migration, create a rollback script:

**File: `scripts/rollback-access-field.ts`**

```typescript
import { config } from "dotenv";
import { getTursoClient } from "../src/lib/turso";

config();

async function rollback() {
  console.log("Rolling back: Removing access field...");
  
  try {
    const client = getTursoClient();
    
    // Note: SQLite doesn't support DROP COLUMN directly
    // You would need to recreate the table without the column
    console.warn("⚠️  SQLite doesn't support DROP COLUMN.");
    console.warn("To rollback, you need to recreate the table without the column.");
    
  } catch (error) {
    console.error("❌ Rollback failed:", error);
    process.exit(1);
  }
}

rollback();
```

## Best Practices

1. **Always test migrations locally first** before running in production
2. **Keep migration scripts in version control** for audit trail
3. **Name migrations descriptively** (e.g., `migrate-add-access-field.ts`)
4. **Make migrations idempotent** so they can be run multiple times safely
5. **Add rollback scripts** for critical migrations
6. **Document breaking changes** in migration comments
7. **Backup data** before running destructive migrations

## Common Issues

### Issue: "DATABASE_URL and DATABASE_AUTH_TOKEN must be set"

**Solution:** Ensure your `.env` file exists and contains valid credentials:

```env
DATABASE_URL="libsql://your-database.turso.io"
DATABASE_AUTH_TOKEN="eyJhbGciO..."
```

### Issue: "no such table: applications"

**Solution:** The database hasn't been initialized. Run the initial migration first.

### Issue: Migration runs but changes don't appear

**Solution:** Check that you're connected to the correct database (dev vs production).

## Migration Naming Convention

Use descriptive names with dates:

- `migrate-add-access-field.ts` - Adds a new field
- `migrate-rename-column.ts` - Renames a column
- `migrate-create-table.ts` - Creates a new table
- `migrate-add-index.ts` - Adds database index

## Example: Complete Migration Workflow

```bash
# 1. Update schema and types
# Edit prisma/schema.prisma and src/types/index.ts

# 2. Create migration script
# Create scripts/migrate-add-field.ts

# 3. Add npm script
# Edit package.json to add "migrate:field": "tsx scripts/migrate-add-field.ts"

# 4. Run migration
pnpm migrate:field

# 5. Update application code
# Update src/lib/turso.ts and other relevant files

# 6. Test the changes
pnpm dev
```

## Conclusion

This migration approach gives you full control over database changes while working with Vercel-managed Turso databases. The key is using direct SQL execution through the libSQL client with proper error handling and idempotency checks.

