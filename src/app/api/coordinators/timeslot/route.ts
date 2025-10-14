/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/coordinator/bookings.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

// Define Booking Schema
const BookingSchema = new mongoose.Schema(
  {
    classroomId: { type: String, required: true },
    classroomName: { type: String, required: true },
    selectedSlots: [{ type: String, required: true }],
    capacity: { type: Number, required: true },
    multimedia: { type: Boolean, default: false },
    bookedBy: { type: String, required: true },
    requiresMultimedia: { type: Boolean, default: false },
    requiredCapacity: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { bookings, requiresMultimedia, requiredCapacity } = await req.json();

    if (!bookings || bookings.length === 0) {
      return NextResponse.json(
        { error: "No bookings provided" },
        { status: 400 }
      );
    }

    // Validate all bookings
    for (const booking of bookings) {
      if (!booking.classroomId || !booking.selectedSlots.length) {
        return NextResponse.json(
          { error: "Invalid booking data" },
          { status: 400 }
        );
      }

      // Check capacity requirements
      if (requiredCapacity && booking.capacity < requiredCapacity) {
        return NextResponse.json(
          {
            error: `${booking.classroomName} does not meet capacity requirement`,
          },
          { status: 400 }
        );
      }

      // Check multimedia requirements
      if (requiresMultimedia && !booking.multimedia) {
        return NextResponse.json(
          { error: `${booking.classroomName} does not have multimedia` },
          { status: 400 }
        );
      }
    }

    // Save all bookings
    const savedBookings = await Booking.insertMany(
      bookings.map((booking: any) => ({
        ...booking,
        bookedBy: session.user.email,
        requiresMultimedia,
        requiredCapacity,
      }))
    );

    return NextResponse.json({ success: true, bookings: savedBookings });
  } catch (error: any) {
    console.error("Error creating bookings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create bookings" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const deleted = await Booking.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Booking deleted" });
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete booking" },
      { status: 500 }
    );
  }
}
