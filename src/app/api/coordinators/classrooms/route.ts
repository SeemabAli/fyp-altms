// src/app/api/classrooms/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Classroom from "@/models/Classroom";
import { classroomSchema } from "@/lib/zodSchemas";

// ✅ Get all classrooms
export async function GET() {
  try {
    await connectDB();
    const items = await Classroom.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    console.error("GET /api/classrooms error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch classrooms" },
      { status: 500 }
    );
  }
}

// ✅ Create a new classroom
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = classroomSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // ✅ Check uniqueness by classroomId
    const exists = await Classroom.findOne({
      classroomId: parsed.data.classroomId,
    });
    if (exists) {
      return NextResponse.json(
        { success: false, message: "Classroom ID already exists" },
        { status: 409 }
      );
    }

    const item = await Classroom.create(parsed.data);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err) {
    console.error("POST /api/classrooms error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create classroom" },
      { status: 500 }
    );
  }
}
