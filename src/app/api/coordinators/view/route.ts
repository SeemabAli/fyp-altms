/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ScheduleEntry from "@/models/ScheduleEntry";

import "@/models/Course";
import "@/models/Classroom";
import "@/models/Faculty";

export async function GET() {
  try {
    await connectDB();

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

    const validSchedule = schedule.filter(
      (entry) => entry.courseId && entry.facultyId && entry.roomId
    );

    const orphanIds = schedule
      .filter((entry) => !entry.courseId || !entry.facultyId || !entry.roomId)
      .map((entry) => entry._id);

    if (orphanIds.length > 0) {
      await ScheduleEntry.deleteMany({ _id: { $in: orphanIds } });
      console.log(`Removed ${orphanIds.length} orphaned schedule entries`);
    }

    if (!validSchedule || validSchedule.length === 0) {
      return NextResponse.json(
        { success: false, message: "No schedule generated yet." },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, schedule: validSchedule },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching schedule:", error);
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
