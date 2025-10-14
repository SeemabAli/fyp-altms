// src/app/api/classrooms/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Classroom from "@/models/Classroom";
import { classroomSchema } from "@/lib/zodSchemas";

// ✅ Get one classroom by ID
export async function GET(_req: Request, context: { params: { id: string } }) {
  try {
    await connectDB();
    const classroom = await Classroom.findById(context.params.id);
    if (!classroom) {
      return NextResponse.json(
        { success: false, message: "Classroom not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: classroom });
  } catch (error) {
    console.error("GET Classroom Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ✅ Update classroom by ID
export async function PUT(req: Request, context: { params: { id: string } }) {
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

    const classroom = await Classroom.findByIdAndUpdate(
      context.params.id,
      parsed.data,
      { new: true }
    );
    if (!classroom) {
      return NextResponse.json(
        { success: false, message: "Classroom not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: classroom });
  } catch (error) {
    console.error("PUT Classroom Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ✅ Delete classroom by ID
export async function DELETE(
  _req: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const classroom = await Classroom.findByIdAndDelete(context.params.id);
    if (!classroom) {
      return NextResponse.json(
        { success: false, message: "Classroom not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Classroom deleted" });
  } catch (error) {
    console.error("DELETE Classroom Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
