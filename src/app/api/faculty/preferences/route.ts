import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Course from "@/models/Course";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { facultyPreferenceSchema } from "@/lib/zodSchemas";
import FacultyPreference from "@/models/Faculty";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const facultyId = session.user.id;
    const preference = await FacultyPreference.findOne({ facultyId }).populate(
      "courses",
      "code title"
    );

    if (!preference) {
      return NextResponse.json({ success: true, submitted: false });
    }

    return NextResponse.json({
      success: true,
      submitted: true,
      preference,
    });
  } catch (error) {
    console.error("Error fetching faculty preferences:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = facultyPreferenceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { preferences } = parsed.data;
    const facultyId = session.user.id;
    const existing = await FacultyPreference.findOne({ facultyId });
    if (existing) {
      return NextResponse.json(
        { error: "Preferences already submitted" },
        { status: 400 }
      );
    }

    const validCourses = await Course.find({
      _id: { $in: preferences },
    });

    if (validCourses.length < preferences.length) {
      return NextResponse.json(
        { error: "Invalid course(s) selected" },
        { status: 400 }
      );
    }

    const newPref = await FacultyPreference.create({
      facultyId,
      courses: preferences,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Preferences submitted successfully",
      preference: newPref,
    });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit preferences" },
      { status: 500 }
    );
  }
}
