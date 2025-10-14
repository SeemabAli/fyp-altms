import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ScheduleEntry from "@/models/ScheduleEntry";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { courseId, facultyId, classroomId, slot, day } = await req.json();

    if (!courseId || !facultyId || !classroomId || !slot || !day) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }

    const exists = await ScheduleEntry.findOne({ facultyId, slot, day });
    if (exists) {
      return NextResponse.json(
        { error: "Faculty already has a class in this slot" },
        { status: 400 }
      );
    }

    const entry = await ScheduleEntry.create({
      courseId,
      facultyId,
      classroomId,
      slot,
      day,
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Manual scheduling error:", error);
    return NextResponse.json(
      { error: "Failed to manually schedule" },
      { status: 500 }
    );
  }
}
