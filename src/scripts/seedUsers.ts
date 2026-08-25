import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {}

// ✅ Explicitly load `.env.local` for standalone scripts
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to your .env.local file");
}

const users = [
  {
    name: "Admin User",
    username: "admin",
    email: "admin@gmail.com",
    password: "Admin@123",
    role: "admin",
    designation: "Administrator",
  },
  {
    name: "Coordinator User",
    username: "coordinator",
    email: "coordinator@gmail.com",
    password: "Coordinator@123",
    role: "coordinator",
    designation: "Coordinator",
  },
  {
    name: "Faculty User",
    username: "faculty",
    email: "faculty@gmail.com",
    password: "faculty@123",
    role: "faculty",
    designation: "Lecturer",
  },
  {
    name: "Student User",
    username: "student",
    email: "student@gmail.com",
    password: "Student@123",
    role: "student",
    designation: "Student",
    batch: "2023",
  },
];

async function run() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("✅ MongoDB Connected");

    for (const u of users) {
      const exists = await mongoose.connection
        .collection("users")
        .findOne({ email: u.email });

      if (exists) {
        console.log(`⚠️ User ${u.email} already exists — skipping`);
        continue;
      }

      const hashed = await bcrypt.hash(u.password, 10);
      await mongoose.connection.collection("users").insertOne({
        ...u,
        password: hashed,
        createdAt: new Date(),
      });

      console.log(`✅ Created ${u.email}`);
    }

    console.log("🎉 Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

run();
