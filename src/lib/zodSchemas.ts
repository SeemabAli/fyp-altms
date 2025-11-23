import { z } from "zod";

export const facultySchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  designation: z.enum([
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Lecturer",
  ]),
  department: z.string().min(2, "Department is required"),
});

export const studentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  registrationNumber: z.string().min(3, "Registration number is required"),
  department: z.string().min(2, "Department is required"),
  semester: z.number().min(1).max(8),
  section: z.string().optional(),
});

export const coordinatorSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  department: z.string().min(2, "Department is required"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const courseSchema = z.object({
  code: z.string().min(2),
  title: z.string().min(2),
  creditHours: z.number().min(1).max(4),
  enrollment: z.number().min(1),
  multimediaRequired: z.boolean(),
  studentBatch: z.string().min(2),
});

export const classroomSchema = z.object({
  name: z.string().min(1, "Room name required").trim(),
  capacity: z.number().min(1, "Capacity must be >= 1"),
  type: z.enum(["classroom", "lab"], {
    message: "Type must be 'classroom' or 'lab'",
  }),
  multimedia: z.boolean().default(false),
});

export const createClassroomSchema = classroomSchema.omit({});

export type Classroom = z.infer<typeof classroomSchema>;
export type CreateClassroomRequest = z.infer<typeof createClassroomSchema>;

export const facultyPreferenceSchema = z.object({
  preferences: z
    .array(z.string().min(1, "Please select a course"))
    .min(5, "At least 5 course preferences are required"),
});

export const timetableSchema = z.object({
  facultyId: z.string(),
  courseCode: z.string(),
  courseTitle: z.string(),
  room: z.string(),
  day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
  startTime: z.string(), 
  endTime: z.string(), 
  batch: z.string().optional(),
});

export const facultyProfileSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  designation: z
    .enum([
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Lecturer",
    ])
    .nullable()
    .optional(),
  department: z.string().optional(),
});
export const enrollmentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  courseId: z.string().min(1, "Course is required"),
});
