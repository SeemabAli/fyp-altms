import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FacultyPreference from "@/models/Faculty";
import ScheduleEntry from "@/models/ScheduleEntry";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "coordinator" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const preference = await FacultyPreference.findById(id);

    if (!preference) {
      return NextResponse.json(
        { success: false, error: "Preference not found" },
        { status: 404 }
      );
    }

    const facultyId = preference.facultyId;

    await FacultyPreference.findByIdAndDelete(id);

    const scheduleDeleteResult = await ScheduleEntry.deleteMany({
      facultyId: facultyId,
    });

    return NextResponse.json({
      success: true,
      message: "Preference deleted successfully",
      deletedSchedules: scheduleDeleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting preference:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete preference" },
      { status: 500 }
    );
  }
}
