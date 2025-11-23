// app/api/coordinators/manual-scheduling/[id]/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ScheduleEntry from "@/models/ScheduleEntry";

export async function DELETE(
  _req: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

    const schedule = await ScheduleEntry.findById(context.params.id);

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: "Schedule not found" },
        { status: 404 }
      );
    }

    await ScheduleEntry.findByIdAndDelete(context.params.id);

    return NextResponse.json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
