import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Enrollment from "@/models/Enrollment";
import ScheduleEntry from "@/models/ScheduleEntry";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const studentId = session.user.id;

    // Get enrolled courses for this student
    const enrollments = await Enrollment.find({ studentId }).select("courseId");

    if (enrollments.length === 0) {
      return NextResponse.json({
        success: true,
        timetable: [],
        message: "No enrolled courses found.",
      });
    }

    const courseIds = enrollments.map((e) => e.courseId);

    // Get schedule entries for those courses
    const schedule = await ScheduleEntry.find({ courseId: { $in: courseIds } })
      .populate("courseId", "code title")
      .populate("facultyId", "name designation")
      .populate("roomId", "name capacity multimedia");

    return NextResponse.json({ success: true, timetable: schedule });
  } catch (error) {
    console.error("Error fetching student timetable:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch timetable" },
      { status: 500 }
    );
  }
}
