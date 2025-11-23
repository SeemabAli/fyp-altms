// src/scripts/seedTimeslots.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import Timeslot from "@/models/Timeslot";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("Please add MONGODB_URI to your .env.local file");

// Timeslot data
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const slots = [
  { startTime: "08:00", endTime: "09:30" },
  { startTime: "09:30", endTime: "11:00" },
  { startTime: "11:00", endTime: "12:30" },
  { startTime: "13:30", endTime: "15:00" },
  { startTime: "15:00", endTime: "16:30" },
];

async function run() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("✅ MongoDB Connected");

    for (const day of days) {
      for (let i = 0; i < slots.length; i++) {
        const { startTime, endTime } = slots[i];

        const exists = await Timeslot.findOne({ day, slotIndex: i });
        if (exists) {
          console.log(`Timeslot ${day} ${startTime}-${endTime} already exists — skipping`);
          continue;
        }

        await Timeslot.create({
          day,
          startTime,
          endTime,
          slotIndex: i,
        });
        console.log(`Created Timeslot ${day} ${startTime}-${endTime}`);
      }
    }

    console.log("Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

run();
