import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Enrollment from "@/models/Enrollment";
import ScheduleEntry from "@/models/ScheduleEntry";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    const courseId = enrollment.courseId;

    await Enrollment.findByIdAndDelete(id);

    const scheduleDeleteResult = await ScheduleEntry.deleteMany({
      courseId: courseId,
    });

    return NextResponse.json({
      success: true,
      message: "Enrollment deleted successfully",
      deletedSchedules: scheduleDeleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    return NextResponse.json(
      { error: "Failed to delete enrollment" },
      { status: 500 }
    );
  }
}
