import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Course from "@/models/Course";
import { z } from "zod";

export const courseSchema = z.object({
  code: z.string().min(2, "Course code is required"),
  title: z.string().min(3, "Course title is required"),
  enrollment: z.number().min(1, "Enrollment must be at least 1"),
  multimediaRequired: z.boolean(),
  studentBatch: z.string().optional(),
});

export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, courses }, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

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

    const created = await Course.create({
      ...parsed.data,
      code: parsed.data.code.toUpperCase(),
    });

    return NextResponse.json(
      { success: true, course: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
