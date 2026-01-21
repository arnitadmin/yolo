import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const contents = await db.content.findMany();
    return NextResponse.json(contents);
  } catch (error) {
    console.error("Error fetching contents:", error);
    return NextResponse.json(
      { error: "Failed to fetch contents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const userId = await requireAdmin(request);

    const { slug, title, markdown } = await request.json();

    if (!slug || !title || !markdown) {
      return NextResponse.json(
        { error: "Missing required fields: slug, title, markdown" },
        { status: 400 }
      );
    }

    const content = await db.content.upsert({
      where: { slug },
      update: { title, markdown },
      create: { slug, title, markdown },
    });

    // Log admin action
    await logAdminAction(
      userId,
      "content_update",
      { slug, title },
      request
    );

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating content:", error);
    
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create/update content" },
      { status: 500 }
    );
  }
}
