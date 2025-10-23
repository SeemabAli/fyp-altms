import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Enrollment from "@/models/Enrollment";
import ScheduleEntry from "@/models/ScheduleEntry";

// ✅ Force-register models (this executes their schema code)
import "@/models/Course";
import "@/models/Classroom";
import "@/models/User";
import { NextResponse } from "next/server";

console.log("Registered models on server:", mongoose.modelNames());

export async function GET() {
  try {
    await connectDB();

    console.log("Registered models before populate:", mongoose.modelNames());

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const studentId = session.user.id;

    const enrollments = await Enrollment.find({ studentId }).select("courseId");

    if (enrollments.length === 0) {
      return NextResponse.json({
        success: true,
        timetable: [],
        message: "No enrolled courses found.",
      });
    }

    const courseIds = enrollments.map((e) => e.courseId);

    const schedule = await ScheduleEntry.find({ courseId: { $in: courseIds } })
      .populate({ path: "courseId", model: "Course", select: "code title" })
      .populate({
        path: "facultyId",
        model: "User",
        select: "name designation",
      })
      .populate({
        path: "roomId",
        model: "Classroom",
        select: "name capacity multimedia",
      });

    console.log("Registered models after imports:", mongoose.modelNames());

    return NextResponse.json({ success: true, timetable: schedule });
  } catch (error) {
    console.error("Error fetching student timetable:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch timetable" },
      { status: 500 }
    );
  }
}
