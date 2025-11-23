/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/mongoose";
import FacultyPreference from "@/models/Faculty";
import ScheduleEntry from "@/models/ScheduleEntry";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, role, designation } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: params.id },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      {
        name,
        email,
        role,
        designation: role === "faculty" ? designation : null,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let deletedSchedules = 0;

    if (user.role === "faculty") {
      await FacultyPreference.deleteMany({ facultyId: user._id });
      console.log(`Deleted all FacultyPreferences for ${user.name}`);

      const scheduleDeleteResult = await ScheduleEntry.deleteMany({
        facultyId: user._id,
      });
      deletedSchedules = scheduleDeleteResult.deletedCount;
      console.log(
        `Deleted ${deletedSchedules} schedules for faculty ${user.name}`
      );
    }

    if (user.role === "student") {
      const { default: Enrollment } = await import("@/models/Enrollment");
      const deleted = await Enrollment.deleteMany({ studentId: user._id });
      console.log(
        `Deleted ${deleted.deletedCount} enrollments for ${user.name}`
      );
    }

    // Delete the user
    await User.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: "User and related data deleted successfully",
      deletedSchedules,
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
