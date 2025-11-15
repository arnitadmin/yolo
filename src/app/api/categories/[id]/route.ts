import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/types";

// PUT update category (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    await turso.updateCategory(parseInt(id), validatedData);
    const category = await turso.getCategoryById(parseInt(id));

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);

    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE category (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    await turso.deleteCategory(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);

    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

