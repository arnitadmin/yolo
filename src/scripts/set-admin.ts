/**
 * Script to set a user as admin via Clerk API
 * 
 * Usage:
 * 1. Set CLERK_SECRET_KEY in your .env.local
 * 2. Run: npx tsx src/scripts/set-admin.ts <email>
 * 
 * Example:
 *   npx tsx src/scripts/set-admin.ts user@example.com
 * 
 * Or set via environment variable:
 *   ADMIN_EMAIL=user@example.com npx tsx src/scripts/set-admin.ts
 */

import { clerkClient } from "@clerk/nextjs/server";

async function setUserAsAdmin(email: string) {
  try {
    const client = await clerkClient();
    
    // Get all users and find by email
    const users = await client.users.getUserList({
      emailAddress: [email],
    });

    if (users.data.length === 0) {
      console.error(`❌ User not found: ${email}`);
      return;
    }

    const user = users.data[0];
    
    // Update user's private metadata to include admin role (server-only, not client-accessible)
    await client.users.updateUser(user.id, {
      privateMetadata: {
        ...user.privateMetadata,
        role: "admin",
      },
    });

    console.log(`✅ Successfully set ${email} as admin`);
  } catch (error) {
    console.error("❌ Error setting admin role:", error);
  }
}

// Get email from command line argument or environment variable
const email = process.argv[2] || process.env.ADMIN_EMAIL;

if (!email) {
  console.error("❌ Error: Email address required");
  console.log("\nUsage:");
  console.log("  npx tsx src/scripts/set-admin.ts <email>");
  console.log("\nOr set via environment variable:");
  console.log("  ADMIN_EMAIL=user@example.com npx tsx src/scripts/set-admin.ts");
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error(`❌ Error: Invalid email format: ${email}`);
  process.exit(1);
}

setUserAsAdmin(email);

