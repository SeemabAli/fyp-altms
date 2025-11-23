import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FacultyPreference from "@/models/Faculty";

import "@/models/Course";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "coordinator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const preferences = await FacultyPreference.find()
      .populate("facultyId", "name email designation")
      .populate("courses", "code title")
      .sort({ timestamp: 1 }); 

    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}
