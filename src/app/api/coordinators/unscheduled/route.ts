/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Course from "@/models/Course";
import ScheduleEntry from "@/models/ScheduleEntry";
import User from "@/models/User";
import Classroom from "@/models/Classroom";

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

    const scheduledCourses = await ScheduleEntry.find().distinct("courseId");
    const unscheduledCourses = await Course.find({
      _id: { $nin: scheduledCourses },
    }).lean();

    const scheduledFaculty = await ScheduleEntry.find().distinct("facultyId");
    const unscheduledFaculty = await User.find({
      role: "faculty",
      _id: { $nin: scheduledFaculty },
    }).lean();

    // Fixed: ScheduleEntry has 'roomId', not 'classroomId'
    const scheduledRooms = await ScheduleEntry.find().distinct("roomId");
    const unscheduledRooms = await Classroom.find({
      _id: { $nin: scheduledRooms },
    }).lean();

    return NextResponse.json({
      success: true,
      unscheduledCourses,
      unscheduledFaculty,
      unscheduledRooms,
    });
  } catch (error: any) {
    console.error("Error fetching unscheduled summary:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch unscheduled summary" },
      { status: 500 }
    );
  }
}
