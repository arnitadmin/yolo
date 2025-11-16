import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";

// POST update application order (admin only)
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAdmin(request);

    const body = await request.json();
    const { applicationIds } = body as { applicationIds: number[] };

    if (!Array.isArray(applicationIds)) {
      return NextResponse.json(
        { error: "applicationIds must be an array" },
        { status: 400 }
      );
    }

    // Update each application's order based on its position in the array
    for (let i = 0; i < applicationIds.length; i++) {
      await turso.updateApplication(applicationIds[i], { order: i });
    }

    // Log admin action
    await logAdminAction(userId, "application_reorder", {
      applicationCount: applicationIds.length,
      applicationIds,
    }, request);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering applications:", error);
    
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to reorder applications" },
      { status: 500 }
    );
  }
}

