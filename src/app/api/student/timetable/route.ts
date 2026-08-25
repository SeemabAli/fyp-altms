/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Enrollment from "@/models/Enrollment";
import ScheduleEntry from "@/models/ScheduleEntry";
import Course from "@/models/Course";
import User from "@/models/User";

import "@/models/Course";
import "@/models/Classroom";
import "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const studentId = session.user.id;

    // 1. Check direct enrollments
    const enrollments = await Enrollment.find({ studentId }).select("courseId");
    let courseIds: any[] = enrollments.map((e) => e.courseId);

    // 2. Fallback: If no direct enrollments, check student batch
    if (courseIds.length === 0) {
      const studentUser = await User.findById(studentId).select("batch");
      const batchName = studentUser?.batch || (session.user as any).batch;
      if (batchName) {
        const batchCourses = await Course.find({
          studentBatch: { $regex: new RegExp(`^${batchName.trim()}$`, "i") },
        }).select("_id");
        courseIds = batchCourses.map((c) => c._id);
      }
    }

    if (courseIds.length === 0) {
      return NextResponse.json({
        success: true,
        timetable: [],
        message: "No enrolled courses or batch schedule found.",
      });
    }

    const schedule = await ScheduleEntry.find({ courseId: { $in: courseIds } })
      .populate({ path: "courseId", model: "Course", select: "code title studentBatch" })
      .populate({
        path: "facultyId",
        model: "User",
        select: "name designation email",
      })
      .populate({
        path: "roomId",
        model: "Classroom",
        select: "name capacity multimedia type",
      })
      .lean();

    return NextResponse.json({ success: true, timetable: schedule });
  } catch (error: any) {
    console.error("Error fetching student timetable:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch timetable" },
      { status: 500 }
    );
  }
}
