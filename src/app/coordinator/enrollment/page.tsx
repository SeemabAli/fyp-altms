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
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
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

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedStudent || selectedCourses.length === 0) {
      toast.error("Select a student and at least one course");
      return;
    }

    setSubmitting(true);
    try {
      // Enroll student in all selected courses
      const enrollmentResults = await Promise.all(
        selectedCourses.map(async (courseId) => {
          const res = await fetch("/api/coordinators/enrollment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: selectedStudent,
              courseId: courseId,
            }),
          });
          const data = await res.json();
          return { res, data, courseId };
        })
      );

      // Categorize results
      const successful = enrollmentResults.filter((r) => r.res.ok);
      const failed = enrollmentResults.filter((r) => !r.res.ok);

      // Handle results
      if (successful.length > 0 && failed.length === 0) {
        toast.success(
          `Successfully enrolled in ${successful.length} course(s)`
        );
        setSelectedStudent("");
        setSelectedCourses([]);
        fetchData();
      } else if (successful.length > 0 && failed.length > 0) {
        // Some succeeded, some failed
        toast.success(`${successful.length} course(s) enrolled successfully`);

        // Show specific error messages for failed enrollments
        failed.forEach((f) => {
          const course = courses.find((c) => c._id === f.courseId);
          const courseName = course ? `${course.code}` : "Course";

          if (f.data.error && f.data.error.includes("already enrolled")) {
            toast.error(`${courseName}: Student already enrolled`);
          } else {
            toast.error(`${courseName}: ${f.data.error || "Failed to enroll"}`);
          }
        });

        // Remove successfully enrolled courses from selection
        setSelectedCourses((prev) =>
          prev.filter((id) => failed.some((f) => f.courseId === id))
        );
        fetchData();
      } else {
        // All failed
        failed.forEach((f) => {
          const course = courses.find((c) => c._id === f.courseId);
          const courseName = course ? `${course.code}` : "Course";

          if (f.data.error && f.data.error.includes("already enrolled")) {
            toast.error(`${courseName}: Student already enrolled`);
          } else {
            toast.error(`${courseName}: ${f.data.error || "Failed to enroll"}`);
          }
        });
      }
    } catch {
      toast.error("Error submitting enrollments");
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
              Assign students to multiple courses so they can view timetables
              later.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
              {/* Student Selection */}
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
                      {s.name
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}{" "}
                      - {s.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Checkboxes */}
              <div>
                <label className="block text-sm font-semibold text-[#493737] mb-2">
                  Select Courses
                </label>
                <div className="border-2 border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto bg-white">
                  {loading ? (
                    <p className="text-gray-500 text-sm">Loading courses...</p>
                  ) : courses.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No courses available
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {courses.map((course) => (
                        <label
                          key={course._id}
                          className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(course._id)}
                            onChange={() => handleCourseToggle(course._id)}
                            className="w-4 h-4 text-[#d89860] border-gray-300 rounded focus:ring-[#d89860] focus:ring-2"
                          />
                          <span className="ml-3 text-sm text-[#493737]">
                            <span className="font-semibold">{course.code}</span>{" "}
                            - {course.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {selectedCourses.length > 0 && (
                  <p className="text-sm text-[#d89860] mt-2 font-medium">
                    {selectedCourses.length} course(s) selected
                  </p>
                )}
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
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#493737]">
                Current Enrollments
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                View and manage all student course enrollments
              </p>
            </div>
            <table className="w-full text-sm text-[#493737]">
              <thead className="bg-[#493737] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Student Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Course Code</th>
                  <th className="px-4 py-3 text-left">Course Title</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Loading enrollments...
                    </td>
                  </tr>
                ) : enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
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
                      <td className="px-4 py-3 text-gray-600">
                        {e.studentId?.email}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#d89860]">
                        {e.courseId?.code}
                      </td>
                      <td className="px-4 py-3">{e.courseId?.title}</td>
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
