/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ScheduleEntry from "@/models/ScheduleEntry";
import FacultyPreference from "@/models/Faculty";
import Course from "@/models/Course";
import Classroom from "@/models/Classroom";

export async function POST() {
  try {
    await connectDB();

    // Fetch existing data
    const preferences = await FacultyPreference.find().populate("facultyId");
    const courses = await Course.find();
    const rooms = await Classroom.find();

    if (!preferences.length || !courses.length || !rooms.length) {
      return NextResponse.json(
        { error: "Insufficient data to generate schedule" },
        { status: 400 }
      );
    }

    // Simplified scheduling logic (placeholder)
    const generated: any[] = [];

    for (const pref of preferences) {
      const faculty = pref.facultyId;
      const selectedCourses = pref.courses.slice(0, 2); // assign 2
      for (const courseId of selectedCourses) {
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const slot = ["08:00-09:30", "10:00-11:30", "12:00-13:30"][Math.floor(Math.random() * 3)];
        const day = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][Math.floor(Math.random() * 5)];

        const entry = await ScheduleEntry.create({
          courseId,
          facultyId: faculty._id,
          classroomId: room._id,
          slot,
          day,
        });

        generated.push(entry);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Schedule generated successfully (${generated.length} entries)`,
      entries: generated,
    });
  } catch (error) {
    console.error("Error generating schedule:", error);
    return NextResponse.json(
      { error: "Failed to generate schedule" },
      { status: 500 }
    );
  }
}
