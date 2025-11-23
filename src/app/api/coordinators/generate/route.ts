import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ScheduleEntry from "@/models/ScheduleEntry";
import Course from "@/models/Course";
import Classroom from "@/models/Classroom";
import FacultyPreference from "@/models/Faculty";

export async function POST() {
  try {
    await connectDB();

    const preferences = await FacultyPreference.find()
      .populate("facultyId")
      .lean();
    const courses = await Course.find().lean();
    const rooms = await Classroom.find().lean();

    if (!preferences.length || !courses.length || !rooms.length) {
      return NextResponse.json(
        { success: false, error: "Insufficient data to generate schedule" },
        { status: 400 }
      );
    }

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const slots = [
      "08:00-09:30",
      "09:30-11:00",
      "11:00-12:30",
      "13:30-15:00",
      "15:00-16:30",
    ];
    let dayIndex = 0;
    let slotIndex = 0;
    let generatedCount = 0;

    for (const pref of preferences) {
      const faculty = pref.facultyId;
      if (!faculty || !pref.courses?.length) continue;

      const selectedCourses = pref.courses.slice(0, 3);

      for (const courseId of selectedCourses) {
        const already = await ScheduleEntry.findOne({
          facultyId: faculty._id,
          courseId,
        });
        if (already) continue;
        const day = days[dayIndex % days.length];
        const slot = slots[slotIndex % slots.length];
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const conflict = await ScheduleEntry.findOne({
          day,
          slot,
          roomId: room._id,
        });
        if (conflict) {
          dayIndex++;
          continue;
        }

        await ScheduleEntry.create({
          courseId,
          facultyId: faculty._id,
          roomId: room._id,
          day,
          slot,
        });

        generatedCount++;

        dayIndex++;
        if (dayIndex % days.length === 0) slotIndex++;
      }
    }

    return NextResponse.json({
      success: true,
      message:
        generatedCount > 0
          ? `Schedule generated successfully (${generatedCount} entries, balanced across weekdays).`
          : "No new schedules added — all already scheduled.",
    });
  } catch (error) {
    console.error("Error generating schedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate schedule" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await connectDB();
    const count = await ScheduleEntry.countDocuments();

    if (count === 0) {
      return NextResponse.json({
        success: false,
        message: "No existing schedule to delete.",
      });
    }

    await ScheduleEntry.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Deleted ${count} schedule entries successfully.`,
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
