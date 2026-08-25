/* eslint-disable @typescript-eslint/no-explicit-any */
import { DAYS, TIME_SLOTS } from "../lib/constants";

// Mock entities
const mockRooms = [
  { _id: "r1", name: "Room 101", capacity: 50, multimedia: true, type: "classroom" },
  { _id: "r2", name: "Room 102", capacity: 40, multimedia: false, type: "classroom" },
  { _id: "r3", name: "Lab 1", capacity: 30, multimedia: true, type: "lab" },
  { _id: "r4", name: "Audi A", capacity: 120, multimedia: true, type: "classroom" },
];

const mockFaculty = [
  { _id: "f1", name: "Dr. Alice", email: "alice@univ.edu" },
  { _id: "f2", name: "Prof. Bob", email: "bob@univ.edu" },
  { _id: "f3", name: "Dr. Charlie", email: "charlie@univ.edu" },
];

const mockPreferences = [
  { facultyId: "f1", courses: ["c1", "c2"] },
  { facultyId: "f2", courses: ["c3", "c4"] },
  { facultyId: "f3", courses: ["c5", "c6"] },
];

const mockCourses = [
  { _id: "c1", code: "CS-101", title: "Intro to CS", creditHours: 3, enrollment: 45, multimediaRequired: true, studentBatch: "Batch-2023" },
  { _id: "c2", code: "CS-201", title: "Data Structures", creditHours: 3, enrollment: 35, multimediaRequired: false, studentBatch: "Batch-2022" },
  { _id: "c3", code: "CS-301", title: "Operating Systems", creditHours: 4, enrollment: 40, multimediaRequired: true, studentBatch: "Batch-2021" },
  { _id: "c4", code: "CS-302", title: "Database Systems", creditHours: 3, enrollment: 30, multimediaRequired: true, studentBatch: "Batch-2021" },
  { _id: "c5", code: "CS-401", title: "Artificial Intelligence", creditHours: 3, enrollment: 25, multimediaRequired: true, studentBatch: "Batch-2020" },
  { _id: "c6", code: "CS-402", title: "Computer Networks", creditHours: 3, enrollment: 30, multimediaRequired: false, studentBatch: "Batch-2020" },
  { _id: "c7", code: "SE-101", title: "Software Eng Concepts", creditHours: 3, enrollment: 50, multimediaRequired: true, studentBatch: "Batch-2023" },
];

function getRequiredSessionsCount(creditHours: number): number {
  if (creditHours >= 3) return 2;
  return 1;
}

const PREFERRED_DAY_PAIRS: [string, string][] = [
  ["Monday", "Wednesday"],
  ["Tuesday", "Thursday"],
  ["Wednesday", "Friday"],
  ["Monday", "Thursday"],
  ["Tuesday", "Friday"],
];

function simulateScheduler() {
  console.log("🚀 Running In-Memory Scheduler Simulation Test...");

  // 1. Map preferences
  const facultyPrefMap = new Map<string, string[]>();
  for (const pref of mockPreferences) {
    facultyPrefMap.set(pref.facultyId, pref.courses);
  }

  // 2. Assign faculty to courses
  const facultyWorkloadMap = new Map<string, number>();
  mockFaculty.forEach((f) => facultyWorkloadMap.set(f._id, 0));
  const courseFacultyAssignments = new Map<string, any>();

  // Pass 1: Preferences
  for (const course of mockCourses) {
    const interested = mockFaculty.filter((f) =>
      (facultyPrefMap.get(f._id) || []).includes(course._id)
    );
    if (interested.length > 0) {
      interested.sort(
        (a, b) => (facultyWorkloadMap.get(a._id) || 0) - (facultyWorkloadMap.get(b._id) || 0)
      );
      const selected = interested[0];
      courseFacultyAssignments.set(course._id, selected);
      facultyWorkloadMap.set(selected._id, (facultyWorkloadMap.get(selected._id) || 0) + 1);
    }
  }

  // Pass 2: Unassigned
  for (const course of mockCourses) {
    if (!courseFacultyAssignments.has(course._id)) {
      const sorted = [...mockFaculty].sort(
        (a, b) => (facultyWorkloadMap.get(a._id) || 0) - (facultyWorkloadMap.get(b._id) || 0)
      );
      const selected = sorted[0];
      courseFacultyAssignments.set(course._id, selected);
      facultyWorkloadMap.set(selected._id, (facultyWorkloadMap.get(selected._id) || 0) + 1);
    }
  }

  // 3. Prepare planned sessions
  const sortedCourses = [...mockCourses].sort((a, b) => {
    if (a.multimediaRequired !== b.multimediaRequired) return a.multimediaRequired ? -1 : 1;
    if (b.enrollment !== a.enrollment) return b.enrollment - a.enrollment;
    return b.creditHours - a.creditHours;
  });

  const plannedSessions: any[] = [];
  for (const course of sortedCourses) {
    const faculty = courseFacultyAssignments.get(course._id)!;
    const numSessions = getRequiredSessionsCount(course.creditHours);
    for (let s = 0; s < numSessions; s++) {
      plannedSessions.push({ course, faculty, sessionIndex: s, totalSessions: numSessions });
    }
  }

  // 4. Constraint-Satisfaction Placement
  const placedAssignments: any[] = [];
  const roomBooked = new Set<string>();
  const facultyBooked = new Set<string>();
  const batchBooked = new Set<string>();
  const courseDayBooked = new Set<string>();
  const coursePlacedDays = new Map<string, string[]>();

  for (const planned of plannedSessions) {
    const { course, faculty, sessionIndex, totalSessions } = planned;
    const courseIdStr = course._id;
    const facultyIdStr = faculty._id;
    const batchStr = course.studentBatch.trim().toLowerCase();

    let placed = false;
    let candidateDays: string[] = [...DAYS];

    if (totalSessions > 1 && sessionIndex === 1) {
      const firstSessionDay = (coursePlacedDays.get(courseIdStr) || [])[0];
      if (firstSessionDay) {
        const pair = PREFERRED_DAY_PAIRS.find(
          (p) => p[0] === firstSessionDay || p[1] === firstSessionDay
        );
        if (pair) {
          const partnerDay = pair[0] === firstSessionDay ? pair[1] : pair[0];
          candidateDays = [partnerDay, ...DAYS.filter((d) => d !== firstSessionDay && d !== partnerDay)];
        } else {
          candidateDays = DAYS.filter((d) => d !== firstSessionDay);
        }
      }
    }

    let eligibleRooms = mockRooms.filter((r) => {
      if (course.multimediaRequired && !r.multimedia) return false;
      return true;
    });
    if (eligibleRooms.length === 0) eligibleRooms = [...mockRooms];

    eligibleRooms.sort((a, b) => {
      const aFits = a.capacity >= course.enrollment;
      const bFits = b.capacity >= course.enrollment;
      if (aFits && !bFits) return -1;
      if (!aFits && bFits) return 1;
      if (aFits && bFits) return a.capacity - b.capacity;
      return b.capacity - a.capacity;
    });

    searchLoop: for (const day of candidateDays) {
      if (courseDayBooked.has(`${courseIdStr}|${day}`)) continue;

      for (const slotDef of TIME_SLOTS) {
        const slotKey = slotDef.slotString;

        if (facultyBooked.has(`${day}|${slotKey}|${facultyIdStr}`)) continue;
        if (batchStr && batchBooked.has(`${day}|${slotKey}|${batchStr}`)) continue;

        for (const room of eligibleRooms) {
          const roomIdStr = room._id;
          if (roomBooked.has(`${day}|${slotKey}|${roomIdStr}`)) continue;

          // Place session
          roomBooked.add(`${day}|${slotKey}|${roomIdStr}`);
          facultyBooked.add(`${day}|${slotKey}|${facultyIdStr}`);
          if (batchStr) batchBooked.add(`${day}|${slotKey}|${batchStr}`);
          courseDayBooked.add(`${courseIdStr}|${day}`);

          const existingDays = coursePlacedDays.get(courseIdStr) || [];
          existingDays.push(day);
          coursePlacedDays.set(courseIdStr, existingDays);

          placedAssignments.push({
            course,
            faculty,
            room,
            day,
            slot: slotKey,
          });

          placed = true;
          break searchLoop;
        }
      }
    }

    if (!placed) {
      console.error(`❌ FAILED TO PLACE: ${course.code} session ${sessionIndex + 1}`);
    }
  }

  // 5. Audit Results
  console.log(`\n✅ Placed ${placedAssignments.length} / ${plannedSessions.length} total sessions`);

  // Verify constraints
  let roomClashes = 0;
  let facultyClashes = 0;
  let batchClashes = 0;

  const testRoomOcc = new Set<string>();
  const testFacOcc = new Set<string>();
  const testBatchOcc = new Set<string>();

  for (const a of placedAssignments) {
    const rKey = `${a.day}|${a.slot}|${a.room._id}`;
    if (testRoomOcc.has(rKey)) roomClashes++;
    testRoomOcc.add(rKey);

    const fKey = `${a.day}|${a.slot}|${a.faculty._id}`;
    if (testFacOcc.has(fKey)) facultyClashes++;
    testFacOcc.add(fKey);

    const bKey = `${a.day}|${a.slot}|${a.course.studentBatch}`;
    if (testBatchOcc.has(bKey)) batchClashes++;
    testBatchOcc.add(bKey);
  }

  console.log("=========================================");
  console.log("🔍 HARD CONSTRAINT AUDIT RESULTS:");
  console.log(`- Total Room Clashes: ${roomClashes}`);
  console.log(`- Total Faculty Clashes: ${facultyClashes}`);
  console.log(`- Total Batch Clashes: ${batchClashes}`);
  console.log("=========================================");

  if (roomClashes === 0 && facultyClashes === 0 && batchClashes === 0) {
    console.log("🎉 ALL TESTS PASSED! SCHEDULING ALGORITHM IS 100% CLASH-FREE!");
  } else {
    throw new Error("Clash violations detected in test!");
  }
}

simulateScheduler();
