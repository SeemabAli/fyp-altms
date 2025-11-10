/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ScheduleEntry from "@/models/ScheduleEntry";

import "@/models/Course";
import "@/models/Classroom";
import "@/models/Faculty";

/**
 * GET /api/coordinators/view
 * Fetch all generated schedule entries with populated references
 */
export async function GET() {
  try {
    await connectDB();

    // ✅ Populate all referenced models properly
    const schedule = await ScheduleEntry.find()
      .populate({
        path: "courseId",
        select: "code title creditHours studentBatch",
      })
      .populate({
        path: "facultyId",
        select: "name designation email",
      })
      .populate({
        path: "roomId",
        select: "name type capacity multimedia",
      })
      .lean();

    if (!schedule || schedule.length === 0) {
      return NextResponse.json(
        { success: false, message: "No schedule generated yet." },
        { status: 200 }
      );
    }

    // ✅ Clean response
    return NextResponse.json({ success: true, schedule }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error fetching schedule:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching schedule entries.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
