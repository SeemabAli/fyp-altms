/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ScheduleEntry from "@/models/ScheduleEntry";

import "@/models/Course";
import "@/models/Classroom";
import "@/models/User";

export async function GET(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const batchFilter = searchParams.get("batch");
    const facultyFilter = searchParams.get("facultyId");
    const roomFilter = searchParams.get("roomId");

    const query: any = {};
    if (facultyFilter) query.facultyId = facultyFilter;
    if (roomFilter) query.roomId = roomFilter;

    const schedule = await ScheduleEntry.find(query)
      .populate({
        path: "courseId",
        select: "code title creditHours studentBatch enrollment multimediaRequired",
      })
      .populate({
        path: "facultyId",
        select: "name designation email",
      })
      .populate({
        path: "roomId",
        select: "name type capacity multimedia",
      })
      .lean();

    const validSchedule = schedule.filter(
      (entry: any) => entry.courseId && entry.facultyId && entry.roomId
    );

    const orphanIds = schedule
      .filter((entry: any) => !entry.courseId || !entry.facultyId || !entry.roomId)
      .map((entry: any) => entry._id);

    if (orphanIds.length > 0) {
      await ScheduleEntry.deleteMany({ _id: { $in: orphanIds } });
      console.log(`Removed ${orphanIds.length} orphaned schedule entries`);
    }

    // Apply batch filter if present
    let filteredSchedule = validSchedule;
    if (batchFilter && batchFilter !== "all") {
      filteredSchedule = validSchedule.filter((entry: any) => {
        const batch = entry.courseId?.studentBatch || "";
        return batch.toLowerCase() === batchFilter.toLowerCase();
      });
    }

    // Extract distinct filter values for the UI dropdowns
    const batches = Array.from(
      new Set(
        validSchedule
          .map((e: any) => e.courseId?.studentBatch)
          .filter(Boolean)
      )
    ).sort();

    const facultyMap = new Map<string, any>();
    validSchedule.forEach((e: any) => {
      const id = e.facultyId?._id?.toString();
      if (id && !facultyMap.has(id)) {
        facultyMap.set(id, e.facultyId);
      }
    });
    const facultyList = Array.from(facultyMap.values());

    const roomMap = new Map<string, any>();
    validSchedule.forEach((e: any) => {
      const id = e.roomId?._id?.toString();
      if (id && !roomMap.has(id)) {
        roomMap.set(id, e.roomId);
      }
    });
    const roomList = Array.from(roomMap.values());

    return NextResponse.json(
      {
        success: true,
        schedule: filteredSchedule,
        filterOptions: {
          batches,
          facultyList,
          roomList,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching schedule entries.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
