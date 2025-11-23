/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import CourseModal from "./CourseModal";
import DeleteModal from "./DeleteModal";

interface Course {
  _id: string;
  code: string;
  title: string;
  enrollment: number;
  multimediaRequired: boolean;
  studentBatch: string;
  creditHours: number;
}

export default function CoordinatorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/coordinators/courses");
      const data = await res.json();
      setCourses(data.courses || []);
    } catch {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      <div className="bg-[#493737] text-white px-6 py-4 flex flex-wrap items-center justify-between shadow-md">
        <div className="flex items-center gap-3 min-w-[200px] mb-2 sm:mb-0">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/VU_Logo.png/960px-VU_Logo.png"
              alt="VU Logo"
              className="w-8 h-auto"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <span className="text-lg font-semibold">
            Automated Timetable System
          </span>
        </div>
        <LogoutButton />
      </div>

      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          {/* Header Row */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#493737]">
              Manage Courses
            </h1>
            <button
              onClick={() => {
                setSelected(null);
                setOpen(true);
              }}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#d89860] to-[#e0a670] text-white font-semibold shadow-md hover:shadow-lg transition"
            >
              + Add Course
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full text-sm text-[#493737]">
              <thead className="bg-[#493737] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Credit Hours</th>
                  <th className="px-4 py-3 text-left">Enrollment</th>
                  <th className="px-4 py-3 text-left">Multimedia</th>
                  <th className="px-4 py-3 text-left">Batch</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-8 text-gray-500 italic"
                    >
                      Loading courses...
                    </td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-8 text-gray-500 italic"
                    >
                      No courses found.
                    </td>
                  </tr>
                ) : (
                  courses.map((course, idx) => (
                    <tr
                      key={course._id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium">{course.code}</td>
                      <td className="px-4 py-3">{course.title}</td>
                      <td className="px-4 py-3 text-center">
                        {course.creditHours}
                      </td>
                      <td className="px-4 py-3">{course.enrollment}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                            course.multimediaRequired
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {course.multimediaRequired ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{course.studentBatch}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => {
                            setSelected(course);
                            setOpen(true);
                          }}
                          className="p-2 rounded-lg bg-[#d89860]/20 hover:bg-[#d89860]/30 transition"
                          title="Edit course"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => {
                            setSelected(course);
                            setDeleteOpen(true);
                          }}
                          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition"
                          title="Delete course"
                        >
                          <FiTrash2 className="text-red-600" />
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

      <CourseModal
        open={open}
        setOpen={setOpen}
        refresh={fetchCourses}
        selected={selected}
      />
      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        selected={selected}
        refresh={fetchCourses}
      />
    </ProtectedRoute>
  );
}
