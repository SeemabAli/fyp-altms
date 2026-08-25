/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/coordinators/manual-scheduling/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ScheduleEntry from "@/models/ScheduleEntry";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user.role !== "coordinator" && session.user.role !== "admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    const schedule = await ScheduleEntry.findById(id);

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: "Schedule entry not found" },
        { status: 404 }
      );
    }

    await ScheduleEntry.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Schedule entry deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
