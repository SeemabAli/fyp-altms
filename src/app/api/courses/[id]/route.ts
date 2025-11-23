/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Course from "@/models/Course";
import { z } from "zod";

export const courseUpdateSchema = z.object({
  code: z.string().min(2).optional(),
  title: z.string().min(3).optional(),
  enrollment: z.number().min(1).optional(),
  multimediaRequired: z.boolean().optional(),
  studentBatch: z.string().optional().nullable(),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const course = await Course.findById(params.id);
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = courseUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      );
    }

    const update: any = { ...parsed.data };
    if (update.code) update.code = update.code.toUpperCase();

    const updated = await Course.findByIdAndUpdate(params.id, update, {
      new: true,
    });
    if (!updated)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const deleted = await Course.findByIdAndDelete(params.id);
    if (!deleted)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    return NextResponse.json(
      { message: "Course deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
