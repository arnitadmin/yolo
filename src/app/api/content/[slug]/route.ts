import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const content = await db.content.findUnique({
      where: { slug },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
