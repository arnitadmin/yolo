import { auth, currentUser } from "@clerk/nextjs/server";

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
  
  // Role is stored in publicMetadata
  const role = user.publicMetadata?.role as UserRole | undefined;
  
  console.log("User publicMetadata:", user.publicMetadata);
  console.log("Extracted role:", role);
  
  return role || "guest";
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  console.log("isAdmin check - role:", role, "is admin:", role === "admin");
  return role === "admin";
}

export async function requireAuth() {
  const userId = await getCurrentUser();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function requireAdmin() {
  const userId = await requireAuth();
  const admin = await isAdmin();
  
  console.log("requireAdmin - userId:", userId, "admin:", admin);
  
  if (!admin) {
    throw new Error("Forbidden: Admin access required");
  }
  
  return userId;
}

