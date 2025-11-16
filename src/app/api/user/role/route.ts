import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { role: "guest", isAdmin: false },
        { status: 401 }
      );
    }
    
    // Check if user has admin role in private metadata (server-only)
    const role = user.privateMetadata?.role as string | undefined;
    
    if (process.env.NODE_ENV === 'development') {
      console.log("Role:", role);
    }
    
    // Only return minimal necessary information - do NOT expose metadata
    return NextResponse.json({
      role: role || "guest",
      isAdmin: role === "admin",
      email: user.emailAddresses[0]?.emailAddress,
    });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      { role: "guest", isAdmin: false },
      { status: 500 }
    );
  }
}

