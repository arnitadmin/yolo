/**
 * Script to set a user as admin via Clerk API
 * 
 * Usage:
 * 1. Set CLERK_SECRET_KEY in your .env.local
 * 2. Run: npx tsx src/scripts/set-admin.ts
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
      console.error(`❌ User with email ${email} not found`);
      return;
    }

    const user = users.data[0];
    
    // Update user's public metadata to include admin role
    await client.users.updateUser(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        role: "admin",
      },
    });

    console.log(`✅ Successfully set ${email} as admin`);
    console.log(`User ID: ${user.id}`);
  } catch (error) {
    console.error("❌ Error setting admin role:", error);
  }
}

// Set eric.vaish@aeronsystems.com as admin
setUserAsAdmin("eric.vaish@aeronsystems.com");

