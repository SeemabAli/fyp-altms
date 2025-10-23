/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import toast from "react-hot-toast";
import { Loader2, Trash2, UserPlus } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  email: string;
  batch: string;
}

interface Course {
  _id: string;
  code: string;
  title: string;
}

interface Enrollment {
  _id: string;
  studentId: Student;
  courseId: Course;
}

export default function EnrollmentPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, crsRes, enrRes] = await Promise.all([
        fetch("/api/admin/users?role=student"),
        fetch("/api/courses"),
        fetch("/api/coordinators/enrollment"),
      ]);

      const stuData = await stuRes.json();
      const crsData = await crsRes.json();
      const enrData = await enrRes.json();

      // Filter students with role === "student"
      const studentList = stuData.users
        .filter((u: any) => u.role === "student")
        .map((u: any) => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          batch: u.batch || "N/A",
        }));

      setStudents(studentList);
      setCourses(crsData.courses || crsData);
      setEnrollments(enrData.enrollments || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !selectedCourse) {
      toast.error("Select both student and course");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/coordinators/enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent,
          courseId: selectedCourse,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Enrollment added successfully");
        setSelectedStudent("");
        setSelectedCourse("");
        fetchData();
      } else {
        toast.error(data.error || "Failed to add enrollment");
      }
    } catch {
      toast.error("Error submitting enrollment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/coordinators/enrollment/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Enrollment removed");
        setEnrollments((prev) => prev.filter((e) => e._id !== id));
      } else {
        toast.error("Failed to delete enrollment");
      }
    } catch {
      toast.error("Error deleting enrollment");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      <div className="bg-[#493737] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <span className="text-lg font-semibold">Student Enrollment</span>
        <LogoutButton />
      </div>

      <div className="min-h-screen p-6 bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto">
          {/* ADD ENROLLMENT SECTION */}
          <div className="bg-white/90 rounded-2xl shadow-xl p-8 mb-8">
            <h1 className="text-3xl font-bold text-[#493737] mb-2">
              Enroll Students to Courses
            </h1>
            <p className="text-gray-600 mb-6">
              Assign students to their courses so they can view timetables
              later.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-[#493737] mb-2">
                  Select Student
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  disabled={loading}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#d89860] focus:ring-2 focus:ring-[#d89860]/20 transition bg-white"
                >
                  <option value="">
                    {loading ? "Loading students..." : "Select Student"}
                  </option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.batch})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#493737] mb-2">
                  Select Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  disabled={loading}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#d89860] focus:ring-2 focus:ring-[#d89860]/20 transition bg-white"
                >
                  <option value="">
                    {loading ? "Loading courses..." : "Select Course"}
                  </option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="w-full py-3 bg-gradient-to-r from-[#d89860] to-[#e0a670] text-white rounded-lg hover:shadow-lg hover:scale-105 transition font-semibold flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 mr-2" /> Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" /> Assign Enrollment
                </>
              )}
            </button>
          </div>

          {/* ENROLLED TABLE */}
          <div className="bg-white/90 rounded-2xl shadow-xl overflow-x-auto">
            <table className="w-full text-sm text-[#493737]">
              <thead className="bg-[#493737] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Student Name</th>
                  <th className="px-4 py-3 text-left">Batch</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Course Code</th>
                  <th className="px-4 py-3 text-left">Course Title</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Loading enrollments...
                    </td>
                  </tr>
                ) : enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No enrollments found.
                    </td>
                  </tr>
                ) : (
                  enrollments.map((e, idx) => (
                    <tr
                      key={e._id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium">
                        {e.studentId?.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                          {e.studentId?.batch}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {e.studentId?.email}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#d89860]">
                        {e.courseId?.code}
                      </td>
                      <td className="px-4 py-3">{e.courseId.title}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(e._id)}
                          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition text-red-600"
                          title="Delete enrollment"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
