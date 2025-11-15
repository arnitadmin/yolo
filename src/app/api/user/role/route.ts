import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { role: "guest", isAdmin: false },
        { status: 401 }
      );
    }
    
    // Check if user has admin role in public metadata
    const role = user.publicMetadata?.role as string | undefined;
    
    console.log("User email:", user.emailAddresses[0]?.emailAddress);
    console.log("Public metadata:", user.publicMetadata);
    console.log("Role:", role);
    
    return NextResponse.json({
      role: role || "guest",
      isAdmin: role === "admin",
      email: user.emailAddresses[0]?.emailAddress,
      metadata: user.publicMetadata,
    });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      { role: "guest", isAdmin: false },
      { status: 500 }
    );
  }
}

