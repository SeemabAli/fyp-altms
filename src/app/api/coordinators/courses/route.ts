/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Course from "@/models/Course";
import { courseSchema } from "@/lib/zodSchemas";

// 🧠 GET all courses
export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find().sort({ createdAt: -1 }).lean();

    // ✅ Add default values if fields are missing
    const formatted = courses.map((c: any) => ({
      ...c,
      creditHours: c.creditHours ?? 3,
    }));

    return NextResponse.json({ success: true, courses: formatted });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// 🧠 POST create new course
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = courseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      );
    }

    const exists = await Course.findOne({
      code: parsed.data.code.toUpperCase(),
    });
    if (exists) {
      return NextResponse.json(
        { error: "Course with this code already exists" },
        { status: 409 }
      );
    }

    const data = {
      ...parsed.data,
      code: parsed.data.code.toUpperCase(),
    };

    const newCourse = await Course.create(data);

    return NextResponse.json({ success: true, course: newCourse });
  } catch (error: any) {
    console.error("❌ Error creating course:", error.message);
    console.error(error.stack); // full trace
    return NextResponse.json(
      { success: false, error: "Failed to create course" },
      { status: 500 }
    );
  }
}
