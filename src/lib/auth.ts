import { auth, currentUser } from "@clerk/nextjs/server";
import { logAdminAction } from "./audit";

export type UserRole = "admin" | "user" | "guest";

export async function getCurrentUser() {
  const { userId } = await auth();
  return userId;
}

export async function getUserRole(): Promise<UserRole> {
  const user = await currentUser();
  
  if (!user) {
    return "guest";
  }
  
  // Role is stored in privateMetadata (server-only, not client-accessible)
  const role = user.privateMetadata?.role as UserRole | undefined;
  
  if (process.env.NODE_ENV === 'development') {
    console.log("Extracted role:", role);
  }
  
  return role || "guest";
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  if (process.env.NODE_ENV === 'development') {
    console.log("isAdmin check - role:", role, "is admin:", role === "admin");
  }
  return role === "admin";
}

export async function requireAuth() {
  const userId = await getCurrentUser();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function requireAdmin(request?: Request) {
  const userId = await requireAuth();
  const admin = await isAdmin();
  
  if (process.env.NODE_ENV === 'development') {
    console.log("requireAdmin - admin:", admin);
  }
  
  if (!admin) {
    throw new Error("Forbidden: Admin access required");
  }
  
  // Log admin access for audit trail
  await logAdminAction(userId, "admin_access", {}, request);
  
  return userId;
}

