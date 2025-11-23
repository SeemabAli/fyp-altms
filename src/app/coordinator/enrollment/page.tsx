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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStudent, setModalStudent] = useState<any>(null);
  const [modalCourses, setModalCourses] = useState<any[]>([]);
  const [modalEnrollmentIds, setModalEnrollmentIds] = useState<string[]>([]);

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
        toast.success(`${successful.length} course(s) enrolled successfully`);
        failed.forEach((f) => {
          const course = courses.find((c) => c._id === f.courseId);
          const courseName = course ? `${course.code}` : "Course";

          if (f.data.error && f.data.error.includes("already enrolled")) {
            toast.error(`${courseName}: Student already enrolled`);
          } else {
            toast.error(`${courseName}: ${f.data.error || "Failed to enroll"}`);
          }
        });
        setSelectedCourses((prev) =>
          prev.filter((id) => failed.some((f) => f.courseId === id))
        );
        fetchData();
      } else {
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

  const openCourseModal = (group: any) => {
    setModalStudent(group.student);
    setModalCourses(group.courses);
    setModalEnrollmentIds(group.enrollmentIds);
    setModalOpen(true);
  };

  const handleModalDelete = async (enrollmentId: string) => {
    try {
      const res = await fetch(`/api/coordinators/enrollment/${enrollmentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Course removed");

        // remove from modal list
        setModalCourses((prev) =>
          prev.filter((_, idx) => modalEnrollmentIds[idx] !== enrollmentId)
        );
        setModalEnrollmentIds((prev) =>
          prev.filter((id) => id !== enrollmentId)
        );

        // remove from main table
        setEnrollments((prev) => prev.filter((e) => e._id !== enrollmentId));
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Error deleting course");
    }
  };

  const groupedEnrollments = enrollments.reduce((acc: any, e) => {
    const studentId = e.studentId._id;

    if (!acc[studentId]) {
      acc[studentId] = {
        student: e.studentId,
        courses: [],
        enrollmentIds: [],
      };
    }

    acc[studentId].courses.push(e.courseId);
    acc[studentId].enrollmentIds.push(e._id);

    return acc;
  }, {});

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      <div className="bg-[#493737] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <span className="text-lg font-semibold">Student Enrollment</span>
        <LogoutButton />
      </div>

      <div className="min-h-screen p-6 bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/90 rounded-2xl shadow-xl p-8 mb-8">
            <h1 className="text-3xl font-bold text-[#493737] mb-2">
              Enroll Students to Courses
            </h1>
            <p className="text-gray-600 mb-6">
              Assign students to multiple courses so they can view timetables
              later.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
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
                ) : Object.keys(groupedEnrollments).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No enrollments found.
                    </td>
                  </tr>
                ) : (
                  Object.values(groupedEnrollments).map(
                    (group: any, idx: number) => (
                      <tr
                        key={group.student._id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">
                          {group.student.name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {group.student.email}
                        </td>

                        {/* COURSE LIST */}
                        <td className="px-4 py-3 font-semibold text-[#d89860]">
                          {group.courses.map((c: any) => c.code).join(", ")}
                        </td>
                        <td className="px-4 py-3">
                          {group.courses.map((c: any) => c.title).join(", ")}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => openCourseModal(group)}
                            className="px-4 py-2 bg-gradient-to-r from-[#d89860] to-[#e0a670] 
               text-white rounded-lg hover:shadow-md transition font-medium"
                          >
                            View Courses ({group.courses.length})
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-[#493737] mb-2">
              {modalStudent.name}
            </h2>
            <p className="text-gray-600 mb-4">{modalStudent.email}</p>

            <h3 className="text-lg font-semibold text-[#493737] mb-3">
              Enrolled Courses
            </h3>

            {modalCourses.length === 0 ? (
              <p className="text-gray-500 text-sm">No courses left.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {modalCourses.map((course, idx) => (
                  <div
                    key={modalEnrollmentIds[idx]}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-[#d89860]">
                        {course.code}
                      </p>
                      <p className="text-sm text-[#493737]">{course.title}</p>
                    </div>

                    <button
                      onClick={() => handleModalDelete(modalEnrollmentIds[idx])}
                      className="p-2 rounded-lg bg-red-100 hover:bg-red-200 
                           transition text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="w-full py-3 bg-[#493737] text-white rounded-lg 
                     hover:opacity-90 transition font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
