import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { applicationSchema } from "@/types";

// GET all applications (optionally filtered by category)
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");

    const applications = await db.application.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

// POST create new application (admin only)
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAdmin();

    const body = await request.json();
    const validatedData = applicationSchema.parse(body);

    const application = await db.application.create({
      data: {
        ...validatedData,
        createdBy: userId,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

