/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ScheduleEntry from "@/models/ScheduleEntry";
import { runTimetableScheduler } from "@/lib/scheduler";

export async function POST() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user.role !== "coordinator" && session.user.role !== "admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const metrics = await runTimetableScheduler();

    return NextResponse.json({
      success: true,
      message: `Schedule generated successfully: ${metrics.totalSessionsScheduled} sessions scheduled across ${metrics.fullyScheduledCoursesCount} fully completed courses.`,
      metrics,
    });
  } catch (error: any) {
    console.error("Error generating schedule:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate schedule" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user.role !== "coordinator" && session.user.role !== "admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
  } catch (error: any) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
