import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Enrollment from "@/models/Enrollment";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const deleted = await Enrollment.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    return NextResponse.json(
      { error: "Failed to delete enrollment" },
      { status: 500 }
    );
  }
}
