import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { requireAdmin } from "@/lib/auth";
import { applicationSchema } from "@/types";
import { logAdminAction } from "@/lib/audit";

// PUT update application (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAdmin(request);

    const { id } = await params;
    const body = await request.json();
    const validatedData = applicationSchema.parse(body);

    await turso.updateApplication(parseInt(id), validatedData);
    const application = await turso.getApplicationById(parseInt(id));

    // Log admin action
    await logAdminAction(userId, "application_update", {
      applicationId: parseInt(id),
      name: validatedData.name,
      changes: Object.keys(validatedData),
    }, request);

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
    const userId = await requireAdmin(request);

    const { id } = await params;

    // Get application details before deletion for audit log
    const application = await turso.getApplicationById(parseInt(id));

    await turso.deleteApplication(parseInt(id));

    // Log admin action
    await logAdminAction(userId, "application_delete", {
      applicationId: parseInt(id),
      name: application?.name,
    }, request);

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

