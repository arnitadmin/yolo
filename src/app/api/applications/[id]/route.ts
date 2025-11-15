import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { requireAdmin } from "@/lib/auth";
import { applicationSchema } from "@/types";

// PUT update application (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const validatedData = applicationSchema.parse(body);

    await turso.updateApplication(parseInt(id), validatedData);
    const application = await turso.getApplicationById(parseInt(id));

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error updating application:", error);

    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

// DELETE application (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    await turso.deleteApplication(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting application:", error);

    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}

