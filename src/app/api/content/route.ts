import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
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
    const { userId } = await auth();

    // TODO: Add admin check - for now, allow any authenticated user
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating content:", error);
    return NextResponse.json(
      { error: "Failed to create/update content" },
      { status: 500 }
    );
  }
}
