/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import BackButton from "@/components/BackButton";
import ScheduleDeleteModal from "./ScheduleDelete";
import {
  Loader2,
  Trash2,
  Calendar,
  Eye,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function GenerateSchedulePage() {
  const [loading, setLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setGenerationResult(null);
    try {
      const res = await fetch("/api/coordinators/generate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setGenerationResult(data.metrics);
      } else {
        toast.error(data.error || data.message || "Failed to generate schedule");
      }
    } catch {
      toast.error("Something went wrong during schedule generation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["coordinator", "admin"]}>
      <header className="bg-[#493737] text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <BackButton fallbackUrl="/coordinator/dashboard" />
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/VU_Logo.png/960px-VU_Logo.png"
              alt="VU Logo"
              className="w-7"
            />
          </div>
          <span className="font-semibold text-lg">
            Automated Timetable System
          </span>
        </div>
        <LogoutButton />
      </header>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Card */}
          <div className="bg-white rounded-2xl shadow-xl border-t-4 border-[#d89860] overflow-hidden">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-[#493737] to-[#5a4545] text-white px-8 py-10 text-center relative">
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="bg-[#d89860] p-4 rounded-full shadow-lg">
                    <Calendar className="w-10 h-10" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold mb-2">
                  Automatic Timetable Generator
                </h1>
                <p className="text-gray-200 max-w-xl mx-auto text-sm">
                  Generates clash-free schedules across all student batches, faculty preferences, room capacities, and multimedia constraints.
                </p>
              </div>
            </div>

            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-[#d89860] hover:bg-[#c98750] text-white py-3.5 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                  <span>{loading ? "Optimizing & Generating..." : "Generate Schedule"}</span>
                </button>

                <Link
                  href="/coordinator/view-schedule"
                  className="bg-[#6b8e9f] hover:bg-[#5a7d8e] text-white py-3.5 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Eye className="h-5 w-5" />
                  <span>View Master Schedule</span>
                </Link>
              </div>

              <button
                onClick={() => setOpenDelete(true)}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-semibold shadow w-full flex items-center justify-center gap-2 disabled:opacity-50 transition cursor-pointer"
              >
                <Trash2 className="h-5 w-5" />
                <span>Delete Existing Schedule</span>
              </button>
            </div>
          </div>

          {/* Results Summary Card */}
          {generationResult && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-green-500 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2.5 rounded-full">
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Generation Summary
                    </h2>
                    <p className="text-sm text-gray-500">
                      All constraints were evaluated and satisfied
                    </p>
                  </div>
                </div>
                <Link
                  href="/coordinator/view-schedule"
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" /> View in Grid
                </Link>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
                    <BookOpen className="w-4 h-4 text-[#d89860]" /> Total Courses
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {generationResult.totalCourses}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Fully Scheduled
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {generationResult.fullyScheduledCoursesCount}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
                    <Calendar className="w-4 h-4 text-[#6b8e9f]" /> Total Sessions
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {generationResult.totalSessionsScheduled}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
                    <AlertCircle className="w-4 h-4 text-red-400" /> Unscheduled
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {generationResult.unscheduledCoursesCount}
                  </div>
                </div>
              </div>

              {/* Scheduled Courses Table Preview */}
              {generationResult.scheduledDetails?.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-[#493737] mb-3">
                    Scheduled Course Allocation Breakdown
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-100 text-gray-700 text-xs font-semibold">
                        <tr>
                          <th className="px-4 py-2.5">Course</th>
                          <th className="px-4 py-2.5">Batch</th>
                          <th className="px-4 py-2.5">Faculty</th>
                          <th className="px-4 py-2.5">Scheduled Sessions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {generationResult.scheduledDetails.map((item: any) => (
                          <tr key={item.courseId} className="hover:bg-gray-50/70">
                            <td className="px-4 py-2 font-medium text-gray-900">
                              {item.code} - {item.title}
                            </td>
                            <td className="px-4 py-2 text-gray-600 text-xs">
                              {item.batch}
                            </td>
                            <td className="px-4 py-2 text-gray-600 text-xs">
                              {item.facultyName}
                            </td>
                            <td className="px-4 py-2 text-xs">
                              <div className="flex flex-wrap gap-1">
                                {item.sessions.map((s: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono"
                                  >
                                    {s.day.slice(0, 3)} {s.slot} ({s.roomName})
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ScheduleDeleteModal
        open={openDelete}
        setOpen={setOpenDelete}
        refresh={() => window.location.reload()}
      />
    </ProtectedRoute>
  );
}
