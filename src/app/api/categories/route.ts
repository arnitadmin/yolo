import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/types";

// GET all categories
export async function GET() {
  try {
    await requireAuth();

    const categories = await turso.getCategories();

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

    const categoryId = await turso.createCategory(validatedData);
    const category = await turso.getCategoryById(Number(categoryId));

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

