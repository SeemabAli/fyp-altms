
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ScheduleEntry from "@/models/ScheduleEntry";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { courseId, facultyId, roomId, slot, day } = await req.json();

    if (!courseId || !facultyId || !roomId || !slot || !day) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const exists = await ScheduleEntry.findOne({ facultyId, slot, day });
    if (exists) {
      return NextResponse.json(
        { error: "Faculty already has a class in this slot" },
        { status: 409 }
      );
    }

    const roomTaken = await ScheduleEntry.findOne({ roomId, slot, day });
    if (roomTaken) {
      return NextResponse.json(
        { error: "This room is already booked in this slot" },
        { status: 409 }
      );
    }

    const entry = await ScheduleEntry.create({
      courseId,
      facultyId,
      roomId,
      slot,
      day,
    });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    console.error("Manual scheduling error:", error);
    return NextResponse.json(
      { error: "Failed to manually schedule" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const schedules = await ScheduleEntry.find()
      .populate("courseId", "code title")
      .populate("facultyId", "name email")
      .populate("roomId", "classroomId name")
      .lean();

    return NextResponse.json({ success: true, data: schedules });
  } catch (error) {
    console.error("Fetch manual schedules error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}
