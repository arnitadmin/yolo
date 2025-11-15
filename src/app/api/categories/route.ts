import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/types";

// GET all categories
export async function GET() {
  try {
    await requireAuth();

    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST create new category (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    const category = await db.category.create({
      data: validatedData,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);

    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

