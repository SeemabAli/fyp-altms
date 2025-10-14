import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Course from "@/models/Course";
import ScheduleEntry from "@/models/ScheduleEntry";
import User from "@/models/User";
import Classroom from "@/models/Classroom";

export async function GET() {
  try {
    await connectDB();

    // Find scheduled course IDs
    const scheduledCourses = await ScheduleEntry.find().distinct("courseId");
    const unscheduledCourses = await Course.find({
      _id: { $nin: scheduledCourses },
    });

    // Find faculty who have preferences but no assigned schedule
    const scheduledFaculty = await ScheduleEntry.find().distinct("facultyId");
    const unscheduledFaculty = await User.find({
      role: "faculty",
      _id: { $nin: scheduledFaculty },
    });

    // Find rooms/labs not assigned in any schedule entry
    const scheduledRooms = await ScheduleEntry.find().distinct("classroomId");
    const unscheduledRooms = await Classroom.find({
      _id: { $nin: scheduledRooms },
    });

    return NextResponse.json({
      success: true,
      unscheduledCourses,
      unscheduledFaculty,
      unscheduledRooms,
    });
  } catch (error) {
    console.error("Error fetching unscheduled summary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch unscheduled summary" },
      { status: 500 }
    );
  }
}
