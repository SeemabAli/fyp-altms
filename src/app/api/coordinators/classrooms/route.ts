/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Classroom from "@/models/Classroom";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { createClassroomSchema } from "@/lib/zodSchemas";

// Fixed time slots: 08:00–16:30, 5 slots per day
const FIXED_TIME_SLOTS = [
  { startTime: "08:00", endTime: "10:00" },
  { startTime: "10:00", endTime: "12:00" },
  { startTime: "12:00", endTime: "14:00" },
  { startTime: "14:00", endTime: "16:00" },
  { startTime: "16:00", endTime: "16:30" },
];

export async function GET() {
  try {
    await connectDB();
    const classrooms = await Classroom.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, classrooms });
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch classrooms" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "coordinator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    const validation = createClassroomSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, capacity, type, multimedia } = validation.data;

    const classroom = await Classroom.create({
      name,
      capacity: Number(capacity),
      type,
      multimedia: Boolean(multimedia),
      timeSlots: FIXED_TIME_SLOTS,
    });

    return NextResponse.json({ success: true, classrooms: [classroom] });
  } catch (error: any) {
    console.error("Error adding classroom:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Room already exists with this name" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to add classroom" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "coordinator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, capacity, type, multimedia } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Classroom ID required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid classroom ID" },
        { status: 400 }
      );
    }

    const validation = createClassroomSchema.safeParse({
      name,
      capacity,
      type,
      multimedia,
    });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const updated = await Classroom.findByIdAndUpdate(
      id,
      {
        name,
        capacity: Number(capacity),
        type,
        multimedia: Boolean(multimedia),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, classroom: updated });
  } catch (error: any) {
    console.error("Error updating classroom:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update classroom" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "coordinator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Classroom ID required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid classroom ID" },
        { status: 400 }
      );
    }

    const deleted = await Classroom.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Classroom deleted" });
  } catch (error: any) {
    console.error("Error deleting classroom:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete classroom" },
      { status: 500 }
    );
  }
}
