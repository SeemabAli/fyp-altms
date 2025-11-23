import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Course from "@/models/Course";
import ScheduleEntry from "@/models/ScheduleEntry";
import { courseSchema } from "@/lib/zodSchemas";

export async function GET(_req: Request, context: { params: { id: string } }) {
  try {
    await connectDB();
    const c = await Course.findById(context.params.id).lean();
    if (!c) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    const formatted = {
      ...c,
      creditHours: c.creditHours ?? 3,
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    console.error("GET /api/courses/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = courseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = {
      ...parsed.data,
    };

    const updated = await Course.findByIdAndUpdate(context.params.id, data, {
      new: true,
    });
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT /api/courses/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

    const course = await Course.findById(context.params.id);

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    const courseId = course._id;

    await Course.findByIdAndDelete(context.params.id);

    const scheduleDeleteResult = await ScheduleEntry.deleteMany({
      courseId: courseId,
    });

    return NextResponse.json({
      success: true,
      data: course,
      message: "Course deleted successfully",
      deletedSchedules: scheduleDeleteResult.deletedCount,
    });
  } catch (err) {
    console.error("DELETE /api/courses/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete" },
      { status: 500 }
    );
  }
}
