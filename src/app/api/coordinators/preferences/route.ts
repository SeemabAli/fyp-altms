import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FacultyPreference from "@/models/Faculty";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "coordinator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all faculty preferences with faculty + course info
    const preferences = await FacultyPreference.find()
      .populate("facultyId", "name email designation")
      .populate("courses", "code title")
      .sort({ timestamp: 1 }); // older first (tie-breaker)

    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}
