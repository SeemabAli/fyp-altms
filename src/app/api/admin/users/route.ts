import { NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";

export async function GET() {
  try {
    await connectDB();
    // Include tempPassword field to show plaintext passwords
    const users = await User.find({})
      .select("name email role designation batch createdAt")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, role, designation } = await req.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Generate random password
    const plainPassword = Math.random().toString(36).slice(-8) + "@123";
    const hashed = await bcrypt.hash(plainPassword, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
      role,
      designation: role === "faculty" ? designation : null,
    });

    // Return user with tempPassword for display
    return NextResponse.json({
      success: true,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        designation: newUser.designation,
        tempPassword: plainPassword,
        createdAt: newUser.createdAt,
      },
      password: plainPassword,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
