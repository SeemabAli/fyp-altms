/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ScheduleEntry from "@/models/ScheduleEntry";
import Course from "@/models/Course";

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user.role !== "coordinator" && session.user.role !== "admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { courseId, facultyId, roomId, slot, day } = await req.json();

    if (!courseId || !facultyId || !roomId || !slot || !day) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // 1. Check Faculty clash
    const facultyClash = await ScheduleEntry.findOne({ facultyId, slot, day });
    if (facultyClash) {
      return NextResponse.json(
        { error: "Faculty member already has a class scheduled in this time slot and day" },
        { status: 409 }
      );
    }

    // 2. Check Room clash
    const roomClash = await ScheduleEntry.findOne({ roomId, slot, day });
    if (roomClash) {
      return NextResponse.json(
        { error: "This classroom/lab is already booked in this time slot and day" },
        { status: 409 }
      );
    }

    // 3. Check Student Batch clash
    const targetCourse = await Course.findById(courseId);
    if (targetCourse && targetCourse.studentBatch) {
      const slotEntries = await ScheduleEntry.find({ day, slot }).populate(
        "courseId",
        "studentBatch code"
      );
      const batchClash = slotEntries.find(
        (e: any) =>
          e.courseId?.studentBatch &&
          e.courseId.studentBatch.trim().toLowerCase() ===
            targetCourse.studentBatch.trim().toLowerCase()
      );
      if (batchClash) {
        const clashCourse = batchClash.courseId as any;
        return NextResponse.json(
          {
            error: `Student batch '${targetCourse.studentBatch}' already has another course (${clashCourse?.code || "Course"}) in this slot`,
          },
          { status: 409 }
        );
      }
    }

    const entry = await ScheduleEntry.create({
      courseId,
      facultyId,
      roomId,
      slot,
      day,
    });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error: any) {
    console.error("Manual scheduling error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to manually schedule" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user.role !== "coordinator" && session.user.role !== "admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const schedules = await ScheduleEntry.find()
      .populate("courseId", "code title studentBatch")
      .populate("facultyId", "name email designation")
      .populate("roomId", "name capacity type multimedia")
      .lean();

    return NextResponse.json({ success: true, data: schedules });
  } catch (error: any) {
    console.error("Fetch manual schedules error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}
