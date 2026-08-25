/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ScheduleEntry from "@/models/ScheduleEntry";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import "@/models/Course";
import "@/models/Classroom";
import "@/models/Faculty";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const timetable = await ScheduleEntry.find({
      facultyId: session.user.id,
    })
      .populate("courseId", "code title studentBatch creditHours")
      .populate("roomId", "name capacity type multimedia")
      .sort({ day: 1 });

    return NextResponse.json({ success: true, timetable });
  } catch (error: any) {
    console.error("Error fetching faculty timetable:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch timetable" },
      { status: 500 }
    );
  }
}
