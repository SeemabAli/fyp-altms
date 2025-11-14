/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface Course {
  _id: string;
  code: string;
  title: string;
}

interface Faculty {
  _id: string;
  name: string;
  email: string;
  designation: string;
}

interface Classroom {
  _id: string;
  classroomId?: string;
  name?: string;
}

export default function ManualSchedulingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [form, setForm] = useState({
    courseId: "",
    facultyId: "",
    classroomId: "",
    day: "",
    slot: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  // ✅ Updated: Match generation slots (5 slots per day, 08:00-16:30)
  const slots = [
    "08:00-09:30",
    "09:30-11:00",
    "11:00-12:30",
    "13:30-15:00",
    "15:00-16:30",
  ];

  // Fetch data on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchUnscheduled(),
      fetchFaculties(),
      fetchClassrooms(),
    ]).finally(() => setLoading(false));
  }, []);

  const fetchUnscheduled = async () => {
    try {
      const res = await fetch("/api/coordinators/unscheduled");
      const data = await res.json();
      if (res.ok) setCourses(data.unscheduledCourses || []);
      else toast.error(data.error || "Failed to fetch unscheduled courses");
    } catch {
      toast.error("Failed to fetch unscheduled courses");
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await fetch("/api/admin/users?role=faculty");
      const data = await res.json();

      if (res.ok && data.users) {
        // Filter only faculty users
        const facultyList = data.users
          .filter((user: any) => user.role === "faculty")
          .map((user: any) => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            designation: user.designation || "Faculty",
          }));
        setFaculties(facultyList);
      } else {
        toast.error(data.error || "Failed to fetch faculty list");
      }
    } catch {
      toast.error("Failed to fetch faculty list");
    }
  };

  const fetchClassrooms = async () => {
    try {
      const res = await fetch("/api/coordinators/classrooms");
      const data = await res.json();
      if (res.ok) {
        const classroomList = data.data || data.classrooms || [];
        setClassrooms(classroomList);
      }
    } catch {
      toast.error("Failed to fetch classrooms");
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.courseId ||
      !form.facultyId ||
      !form.classroomId ||
      !form.day ||
      !form.slot
    ) {
      toast.error("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/coordinators/manual-scheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, roomId: form.classroomId }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Course scheduled successfully");
        setForm({
          courseId: "",
          facultyId: "",
          classroomId: "",
          day: "",
          slot: "",
        });
        fetchUnscheduled(); // refresh unscheduled list
      } else {
        toast.error(data.error || "Scheduling failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      {/* HEADER */}
      <div className="bg-[#493737] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <span className="text-lg font-semibold">Manual Scheduling</span>
        <LogoutButton />
      </div>

      {/* CONTENT */}
      <div className="min-h-screen p-6 bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-[#493737] mb-2">
              Assign Unscheduled Courses
            </h1>
            <p className="text-gray-600 mb-8">
              Select an unscheduled course and manually assign it to a faculty
              member, room, and slot.
            </p>

            {/* FORM */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#493737] mb-2">
                  Unscheduled Course
                </label>
                <select
                  value={form.courseId}
                  onChange={(e) => handleChange("courseId", e.target.value)}
                  disabled={loading}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#d89860] focus:ring-2 focus:ring-[#d89860]/20 transition bg-white"
                >
                  <option value="">
                    {loading ? "Loading courses..." : "Select course"}
                  </option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#493737] mb-2">
                  Faculty Member
                </label>
                <select
                  value={form.facultyId}
                  onChange={(e) => handleChange("facultyId", e.target.value)}
                  disabled={loading}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#d89860] focus:ring-2 focus:ring-[#d89860]/20 transition bg-white"
                >
                  <option value="">
                    {loading ? "Loading faculty..." : "Select faculty"}
                  </option>
                  {faculties.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.designation}) - {f.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#493737] mb-2">
                  Classroom/Lab
                </label>
                <select
                  value={form.classroomId}
                  onChange={(e) => handleChange("classroomId", e.target.value)}
                  disabled={loading}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#d89860] focus:ring-2 focus:ring-[#d89860]/20 transition bg-white"
                >
                  <option value="">
                    {loading ? "Loading classrooms..." : "Select classroom"}
                  </option>
                  {classrooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.classroomId || r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#493737] mb-2">
                    Day
                  </label>
                  <select
                    value={form.day}
                    onChange={(e) => handleChange("day", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#d89860] focus:ring-2 focus:ring-[#d89860]/20 transition bg-white"
                  >
                    <option value="">Select day</option>
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#493737] mb-2">
                    Time Slot
                  </label>
                  <select
                    value={form.slot}
                    onChange={(e) => handleChange("slot", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#d89860] focus:ring-2 focus:ring-[#d89860]/20 transition bg-white"
                  >
                    <option value="">Select slot</option>
                    {slots.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="mt-8 w-full py-3 bg-gradient-to-r from-[#d89860] to-[#e0a670] text-white rounded-lg hover:shadow-lg hover:scale-105 transition font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" /> Assigning...
                </>
              ) : (
                "Assign Manually"
              )}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
