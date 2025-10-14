import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ScheduleEntry from "@/models/ScheduleEntry";

export async function GET() {
  try {
    await connectDB();
    const schedule = await ScheduleEntry.find()
      .populate("facultyId", "name designation")
      .populate("courseId", "code title")
      .populate("classroomId", "name")
      .sort({ day: 1, slot: 1 });

    return NextResponse.json({ success: true, schedule });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
