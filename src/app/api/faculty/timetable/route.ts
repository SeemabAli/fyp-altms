import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Timetable from "@/models/Timetable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const timetable = await Timetable.find({ facultyId: session.user.id }).sort(
      { day: 1, startTime: 1 }
    );

    return NextResponse.json({ success: true, timetable });
  } catch (error) {
    console.error("Error fetching timetable:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch timetable" },
      { status: 500 }
    );
  }
}
