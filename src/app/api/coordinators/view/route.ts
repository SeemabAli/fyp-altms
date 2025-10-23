import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ScheduleEntry from "@/models/ScheduleEntry";

export async function GET() {
  try {
    await connectDB();

    // 🧠 Step 2: Fetch latest schedule entries
    const schedule = await ScheduleEntry.find()
      .populate("facultyId", "name designation")
      .populate("courseId", "code title")
      .populate("roomId", "name")
      .sort({ day: 1, slot: 1 });

    // 🧠 Step 3: Handle case when schedule not yet generated
    if (!schedule || schedule.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No schedule generated yet.",
        schedule: [],
      });
    }

    return NextResponse.json({ success: true, schedule });
  } catch (error) {
    console.error("❌ Error fetching schedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
