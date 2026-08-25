/* eslint-disable @typescript-eslint/no-explicit-any */
import Course from "@/models/Course";
import Classroom from "@/models/Classroom";
import FacultyPreference from "@/models/Faculty";
import ScheduleEntry from "@/models/ScheduleEntry";
import User from "@/models/User";
import { DAYS, TIME_SLOTS } from "./constants";

export interface GenerationMetrics {
  totalCourses: number;
  totalSessionsScheduled: number;
  fullyScheduledCoursesCount: number;
  partiallyScheduledCoursesCount: number;
  unscheduledCoursesCount: number;
  scheduledDetails: Array<{
    courseId: string;
    code: string;
    title: string;
    batch: string;
    facultyName: string;
    sessions: Array<{
      day: string;
      slot: string;
      roomName: string;
    }>;
  }>;
  unscheduledDetails: Array<{
    courseId: string;
    code: string;
    title: string;
    reason: string;
  }>;
  roomUtilization: Record<string, number>;
  facultyWorkload: Record<string, number>;
}

interface PlannedSession {
  course: any;
  faculty: any;
  sessionIndex: number;
  totalSessions: number;
}

interface Assignment {
  courseId: any;
  facultyId: any;
  roomId: any;
  day: string;
  slot: string;
  batch: string;
  roomName: string;
}

/**
 * Determine how many 1.5h sessions per week a course should have based on credit hours.
 * Standard: 3-4 credits = 2 sessions/week (3.0h lecture). 1-2 credits = 1 session/week.
 */
function getRequiredSessionsCount(creditHours: number): number {
  if (creditHours >= 3) return 2;
  return 1;
}

/**
 * Preferred day pairs for multi-session courses to prevent clustering.
 * e.g., Monday & Wednesday, Tuesday & Thursday, Wednesday & Friday.
 */
const PREFERRED_DAY_PAIRS: [string, string][] = [
  ["Monday", "Wednesday"],
  ["Tuesday", "Thursday"],
  ["Wednesday", "Friday"],
  ["Monday", "Thursday"],
  ["Tuesday", "Friday"],
];

export async function runTimetableScheduler(): Promise<GenerationMetrics> {
  // 1. Fetch all required entities
  const [courses, facultyUsers, preferences, rooms] = await Promise.all([
    Course.find().lean<any[]>(),
    User.find({ role: "faculty" }).lean<any[]>(),
    FacultyPreference.find().populate("courses").lean<any[]>(),
    Classroom.find().lean<any[]>(),
  ]);

  if (!courses.length) {
    throw new Error("No courses found in database to schedule.");
  }
  if (!rooms.length) {
    throw new Error("No classrooms or labs found in database.");
  }
  if (!facultyUsers.length) {
    throw new Error("No faculty members found in database.");
  }

  // Map preferences by facultyId string -> array of Course IDs
  const facultyPrefMap = new Map<string, string[]>();
  for (const pref of preferences) {
    if (pref.facultyId) {
      const fId = pref.facultyId.toString();
      const courseIds = (pref.courses || []).map((c: any) =>
        c._id ? c._id.toString() : c.toString()
      );
      facultyPrefMap.set(fId, courseIds);
    }
  }

  // 2. Map Courses to Faculty
  // Track faculty course counts to balance workload
  const facultyWorkloadMap = new Map<string, number>();
  facultyUsers.forEach((f) => facultyWorkloadMap.set(f._id.toString(), 0));

  const courseFacultyAssignments = new Map<string, any>();

  // Pass 1: Assign courses to faculty based on preferences
  for (const course of courses) {
    const courseIdStr = course._id.toString();
    const interestedFaculty: any[] = [];

    for (const faculty of facultyUsers) {
      const fIdStr = faculty._id.toString();
      const prefs = facultyPrefMap.get(fIdStr) || [];
      if (prefs.includes(courseIdStr)) {
        interestedFaculty.push(faculty);
      }
    }

    if (interestedFaculty.length > 0) {
      // Pick the interested faculty with the lowest current workload
      interestedFaculty.sort((a, b) => {
        const loadA = facultyWorkloadMap.get(a._id.toString()) || 0;
        const loadB = facultyWorkloadMap.get(b._id.toString()) || 0;
        return loadA - loadB;
      });

      const selectedFaculty = interestedFaculty[0];
      courseFacultyAssignments.set(courseIdStr, selectedFaculty);
      facultyWorkloadMap.set(
        selectedFaculty._id.toString(),
        (facultyWorkloadMap.get(selectedFaculty._id.toString()) || 0) + 1
      );
    }
  }

  // Pass 2: Assign unassigned courses to the least-loaded faculty
  for (const course of courses) {
    const courseIdStr = course._id.toString();
    if (!courseFacultyAssignments.has(courseIdStr)) {
      // Find faculty with lowest workload
      const sortedFaculty = [...facultyUsers].sort((a, b) => {
        const loadA = facultyWorkloadMap.get(a._id.toString()) || 0;
        const loadB = facultyWorkloadMap.get(b._id.toString()) || 0;
        return loadA - loadB;
      });

      const selectedFaculty = sortedFaculty[0];
      courseFacultyAssignments.set(courseIdStr, selectedFaculty);
      facultyWorkloadMap.set(
        selectedFaculty._id.toString(),
        (facultyWorkloadMap.get(selectedFaculty._id.toString()) || 0) + 1
      );
    }
  }

  // 3. Prepare list of planned sessions
  // Sort courses by Most Constrained First (MRV heuristic):
  // Larger enrollment first, multimedia required first, higher credit hours first
  const sortedCourses = [...courses].sort((a, b) => {
    if (a.multimediaRequired !== b.multimediaRequired) {
      return a.multimediaRequired ? -1 : 1;
    }
    if (b.enrollment !== a.enrollment) {
      return b.enrollment - a.enrollment;
    }
    return (b.creditHours || 3) - (a.creditHours || 3);
  });

  const plannedSessions: PlannedSession[] = [];
  for (const course of sortedCourses) {
    const faculty = courseFacultyAssignments.get(course._id.toString())!;
    const numSessions = getRequiredSessionsCount(course.creditHours || 3);
    for (let s = 0; s < numSessions; s++) {
      plannedSessions.push({
        course,
        faculty,
        sessionIndex: s,
        totalSessions: numSessions,
      });
    }
  }

  // 4. Constraint-Satisfaction Placement Engine
  const placedAssignments: Assignment[] = [];
  const unscheduledReasons: Array<{
    courseId: string;
    code: string;
    title: string;
    reason: string;
  }> = [];

  // Lookup structures for fast collision checks:
  const roomBooked = new Set<string>();
  const facultyBooked = new Set<string>();
  const batchBooked = new Set<string>();
  const courseDayBooked = new Set<string>();

  // Map to track placed days for multi-session courses
  const coursePlacedDays = new Map<string, string[]>();

  for (const planned of plannedSessions) {
    const { course, faculty, sessionIndex, totalSessions } = planned;
    const courseIdStr = course._id.toString();
    const facultyIdStr = faculty._id.toString();
    const batchStr = (course.studentBatch || "").trim().toLowerCase();

    let placed = false;

    // Determine day order preference for multi-session courses
    let candidateDays: string[] = [...DAYS];

    if (totalSessions > 1 && sessionIndex === 1) {
      const firstSessionDay = (coursePlacedDays.get(courseIdStr) || [])[0];
      if (firstSessionDay) {
        // Find preferred partner day
        const pair = PREFERRED_DAY_PAIRS.find(
          (p) => p[0] === firstSessionDay || p[1] === firstSessionDay
        );
        if (pair) {
          const partnerDay = pair[0] === firstSessionDay ? pair[1] : pair[0];
          candidateDays = [
            partnerDay,
            ...DAYS.filter((d) => d !== firstSessionDay && d !== partnerDay),
          ];
        } else {
          candidateDays = DAYS.filter((d) => d !== firstSessionDay);
        }
      }
    }

    // Filter candidate rooms
    let eligibleRooms = rooms.filter((r) => {
      if (course.multimediaRequired && !r.multimedia) return false;
      return true;
    });

    if (eligibleRooms.length === 0) {
      eligibleRooms = [...rooms];
    }

    // Sort rooms by Best-Fit Capacity
    eligibleRooms.sort((a, b) => {
      const aFits = a.capacity >= course.enrollment;
      const bFits = b.capacity >= course.enrollment;
      if (aFits && !bFits) return -1;
      if (!aFits && bFits) return 1;
      if (aFits && bFits) {
        return a.capacity - b.capacity;
      }
      return b.capacity - a.capacity;
    });

    // Try finding an available (day, slot, room)
    searchLoop: for (const day of candidateDays) {
      if (courseDayBooked.has(`${courseIdStr}|${day}`)) {
        continue;
      }

      for (const slotDef of TIME_SLOTS) {
        const slotKey = slotDef.slotString;

        // Check Faculty conflict
        if (facultyBooked.has(`${day}|${slotKey}|${facultyIdStr}`)) {
          continue;
        }

        // Check Batch conflict (if batch specified)
        if (batchStr && batchBooked.has(`${day}|${slotKey}|${batchStr}`)) {
          continue;
        }

        // Check Room availability
        for (const room of eligibleRooms) {
          const roomIdStr = room._id.toString();
          if (roomBooked.has(`${day}|${slotKey}|${roomIdStr}`)) {
            continue;
          }

          // ALL HARD CONSTRAINTS SATISFIED! Place this session.
          roomBooked.add(`${day}|${slotKey}|${roomIdStr}`);
          facultyBooked.add(`${day}|${slotKey}|${facultyIdStr}`);
          if (batchStr) {
            batchBooked.add(`${day}|${slotKey}|${batchStr}`);
          }
          courseDayBooked.add(`${courseIdStr}|${day}`);

          const existingDays = coursePlacedDays.get(courseIdStr) || [];
          existingDays.push(day);
          coursePlacedDays.set(courseIdStr, existingDays);

          placedAssignments.push({
            courseId: course._id,
            facultyId: faculty._id,
            roomId: room._id,
            day,
            slot: slotKey,
            batch: course.studentBatch || "",
            roomName: room.name,
          });

          placed = true;
          break searchLoop;
        }
      }
    }

    if (!placed) {
      unscheduledReasons.push({
        courseId: courseIdStr,
        code: course.code,
        title: course.title,
        reason: `Session ${sessionIndex + 1}/${totalSessions} could not be placed due to capacity, room, or batch clash constraints across all 5 weekdays.`,
      });
    }
  }

  // 5. Persist the generated schedule to DB
  await ScheduleEntry.deleteMany({});

  if (placedAssignments.length > 0) {
    const entriesToInsert = placedAssignments.map((a) => ({
      courseId: a.courseId,
      facultyId: a.facultyId,
      roomId: a.roomId,
      day: a.day,
      slot: a.slot,
    }));
    await ScheduleEntry.insertMany(entriesToInsert);
  }

  // 6. Compile Comprehensive Metrics
  const roomUtilization: Record<string, number> = {};
  rooms.forEach((r) => (roomUtilization[r.name] = 0));
  placedAssignments.forEach((a) => {
    roomUtilization[a.roomName] = (roomUtilization[a.roomName] || 0) + 1;
  });

  const facultyLoad: Record<string, number> = {};
  facultyUsers.forEach((f) => (facultyLoad[f.name] = 0));
  placedAssignments.forEach((a) => {
    const f = facultyUsers.find(
      (user) => user._id.toString() === a.facultyId.toString()
    );
    if (f) {
      facultyLoad[f.name] = (facultyLoad[f.name] || 0) + 1;
    }
  });

  const scheduledMap = new Map<
    string,
    {
      courseId: string;
      code: string;
      title: string;
      batch: string;
      facultyName: string;
      sessions: Array<{ day: string; slot: string; roomName: string }>;
    }
  >();

  for (const a of placedAssignments) {
    const cId = a.courseId.toString();
    const courseObj = courses.find((c) => c._id.toString() === cId);
    const facultyObj = facultyUsers.find(
      (f) => f._id.toString() === a.facultyId.toString()
    );

    if (!scheduledMap.has(cId)) {
      scheduledMap.set(cId, {
        courseId: cId,
        code: courseObj?.code || "",
        title: courseObj?.title || "",
        batch: courseObj?.studentBatch || "N/A",
        facultyName: facultyObj?.name || "Faculty",
        sessions: [],
      });
    }

    scheduledMap.get(cId)!.sessions.push({
      day: a.day,
      slot: a.slot,
      roomName: a.roomName,
    });
  }

  const scheduledDetails = Array.from(scheduledMap.values());
  const fullyScheduledCoursesCount = scheduledDetails.filter((d) => {
    const c = courses.find((crs) => crs._id.toString() === d.courseId);
    const req = getRequiredSessionsCount(c?.creditHours || 3);
    return d.sessions.length === req;
  }).length;

  const partiallyScheduledCoursesCount =
    scheduledDetails.length - fullyScheduledCoursesCount;

  return {
    totalCourses: courses.length,
    totalSessionsScheduled: placedAssignments.length,
    fullyScheduledCoursesCount,
    partiallyScheduledCoursesCount,
    unscheduledCoursesCount: courses.length - scheduledDetails.length,
    scheduledDetails,
    unscheduledDetails: unscheduledReasons,
    roomUtilization,
    facultyWorkload: facultyLoad,
  };
}
