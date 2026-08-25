// src/scripts/seedTimeslots.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import Timeslot from "@/models/Timeslot";
import { DAYS, TIME_SLOTS } from "@/lib/constants";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {}

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("Please add MONGODB_URI to your .env.local file");

async function run() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("✅ MongoDB Connected");

    for (const day of DAYS) {
      for (const slot of TIME_SLOTS) {
        const { start, end, index } = slot;

        const exists = await Timeslot.findOne({ day, slotIndex: index });
        if (exists) {
          console.log(`Timeslot ${day} ${start}-${end} already exists — skipping`);
          continue;
        }

        await Timeslot.create({
          day,
          start,
          end,
          slotIndex: index,
        });
        console.log(`Created Timeslot ${day} ${start}-${end}`);
      }
    }

    console.log("🎉 Timeslot seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

run();
