import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FacultyPreference from "@/models/Faculty";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "coordinator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;

    const deleted = await FacultyPreference.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Preference not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Preference deleted" });
  } catch (error) {
    console.error("Error deleting preference:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete preference" },
      { status: 500 }
    );
  }
}
