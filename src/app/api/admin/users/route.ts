import { NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import FacultyPreference from "@/models/Faculty";

// =================== GET (Fetch Users) ===================
export async function GET() {
  try {
    await connectDB();
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

// =================== POST (Create User) ===================
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

// =================== DELETE (Delete User + Cleanup) ===================
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { id } = await req.json(); // id passed in body

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If faculty, delete all their saved preferences
    if (user.role === "faculty") {
      await FacultyPreference.deleteMany({ facultyId: user._id });
      console.log(`Deleted all FacultyPreferences for ${user.name}`);
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "User and related preferences deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
