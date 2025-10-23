/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Enrollment from "@/models/Enrollment";
import User from "@/models/User";
import Course from "@/models/Course";
import { enrollmentSchema } from "@/lib/zodSchemas";

export async function GET() {
  try {
    await connectDB();

    // ✅ Step 1: check if any students exist
    const studentsExist = await User.exists({ role: "student" });

    // ✅ Step 2: if no students, clear all enrollments
    if (!studentsExist) {
      const { default: Enrollment } = await import("@/models/Enrollment");
      await Enrollment.deleteMany({});
      console.log("⚠️ No students found — cleared all enrollments from DB.");

      return NextResponse.json({
        success: true,
        enrollments: [],
        message: "No students found, all enrollments cleared.",
      });
    }

    // ✅ Step 3: normal behavior
    const enrollments = await Enrollment.find()
      .populate("studentId", "name email batch")
      .populate("courseId", "code title");

    // ✅ Step 4: also filter any orphaned ones (studentId = null)
    const validEnrollments = enrollments.filter((e) => e.studentId);

    // Optional: clean DB of orphaned enrollments permanently
    const orphanIds = enrollments.filter((e) => !e.studentId).map((e) => e._id);
    if (orphanIds.length > 0) {
      await Enrollment.deleteMany({ _id: { $in: orphanIds } });
      console.log(`🧹 Removed ${orphanIds.length} orphan enrollments`);
    }

    return NextResponse.json({ success: true, enrollments: validEnrollments });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = enrollmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { studentId, courseId } = parsed.data;

    // Verify both exist
    const student = await User.findOne({ _id: studentId, role: "student" });
    const course = await Course.findById(courseId);

    if (!student || !course) {
      return NextResponse.json(
        { error: "Invalid student or course" },
        { status: 404 }
      );
    }

    // Create enrollment (unique constraint will handle duplicates)
    const newEnrollment = await Enrollment.create({ studentId, courseId });

    return NextResponse.json({ success: true, newEnrollment });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Student already enrolled in this course" },
        { status: 409 }
      );
    }
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { error: "Failed to create enrollment" },
      { status: 500 }
    );
  }
}
