/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import { runTimetableScheduler } from "@/lib/scheduler";
import ScheduleEntry from "@/models/ScheduleEntry";
import Course from "@/models/Course";
import Classroom from "@/models/Classroom";
import User from "@/models/User";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {}

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

async function testEngine() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("✅ MongoDB Connected for Scheduler Verification Test");

    const courseCount = await Course.countDocuments();
    const roomCount = await Classroom.countDocuments();
    const facultyCount = await User.countDocuments({ role: "faculty" });

    console.log(`📊 DB State: Courses=${courseCount}, Rooms=${roomCount}, Faculty=${facultyCount}`);

    if (courseCount === 0 || roomCount === 0 || facultyCount === 0) {
      console.log("ℹ️ Incomplete database data for full live test. Need courses, rooms, and faculty.");
      process.exit(0);
    }

    console.log("🚀 Executing runTimetableScheduler()...");
    const metrics = await runTimetableScheduler();

    console.log("=========================================");
    console.log("🎉 SCHEDULER EXECUTION RESULT:");
    console.log(`- Total Courses in DB: ${metrics.totalCourses}`);
    console.log(`- Total Sessions Scheduled: ${metrics.totalSessionsScheduled}`);
    console.log(`- Fully Scheduled Courses: ${metrics.fullyScheduledCoursesCount}`);
    console.log(`- Partially Scheduled Courses: ${metrics.partiallyScheduledCoursesCount}`);
    console.log(`- Unscheduled Courses: ${metrics.unscheduledCoursesCount}`);
    console.log("=========================================");

    // Verify Hard Constraints on Database entries:
    const allEntries = await ScheduleEntry.find()
      .populate("courseId")
      .populate("facultyId")
      .populate("roomId")
      .lean();

    let roomClashes = 0;
    let facultyClashes = 0;
    let batchClashes = 0;

    const roomOccupancy = new Set<string>();
    const facultyOccupancy = new Set<string>();
    const batchOccupancy = new Set<string>();

    for (const entry of allEntries as any[]) {
      const roomKey = `${entry.day}|${entry.slot}|${entry.roomId?._id}`;
      if (roomOccupancy.has(roomKey)) {
        roomClashes++;
        console.error(`❌ ROOM CLASH DETECTED: Room ${entry.roomId?.name} on ${entry.day} ${entry.slot}`);
      }
      roomOccupancy.add(roomKey);

      const facultyKey = `${entry.day}|${entry.slot}|${entry.facultyId?._id}`;
      if (facultyOccupancy.has(facultyKey)) {
        facultyClashes++;
        console.error(`❌ FACULTY CLASH DETECTED: Faculty ${entry.facultyId?.name} on ${entry.day} ${entry.slot}`);
      }
      facultyOccupancy.add(facultyKey);

      const batch = entry.courseId?.studentBatch;
      if (batch) {
        const batchKey = `${entry.day}|${entry.slot}|${batch.trim().toLowerCase()}`;
        if (batchOccupancy.has(batchKey)) {
          batchClashes++;
          console.error(`❌ BATCH CLASH DETECTED: Batch ${batch} on ${entry.day} ${entry.slot}`);
        }
        batchOccupancy.add(batchKey);
      }
    }

    console.log("=========================================");
    console.log("🔍 HARD CONSTRAINT AUDIT:");
    console.log(`- Room Clashes: ${roomClashes}`);
    console.log(`- Faculty Clashes: ${facultyClashes}`);
    console.log(`- Batch Clashes: ${batchClashes}`);
    console.log("=========================================");

    if (roomClashes === 0 && facultyClashes === 0 && batchClashes === 0) {
      console.log("✅ ALL HARD CONSTRAINTS FULLY SATISFIED! (100% Clash-Free)");
    } else {
      console.error("❌ CONSTRAINT VIOLATIONS FOUND!");
      process.exit(1);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Test error:", err);
    process.exit(1);
  }
}

testEngine();
