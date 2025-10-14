"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import toast from "react-hot-toast";
import { Loader2, AlertTriangle } from "lucide-react";

interface Course {
  _id: string;
  code: string;
  title: string;
}

interface Faculty {
  _id: string;
  name: string;
  designation: string;
}

interface Classroom {
  _id: string;
  name: string;
  capacity: number;
}

export default function UnscheduledSummaryPage() {
  const [loading, setLoading] = useState(true);
  const [unscheduledCourses, setUnscheduledCourses] = useState<Course[]>([]);
  const [unscheduledFaculty, setUnscheduledFaculty] = useState<Faculty[]>([]);
  const [unscheduledRooms, setUnscheduledRooms] = useState<Classroom[]>([]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/coordinators/unscheduled");
      const data = await res.json();

      if (res.ok) {
        setUnscheduledCourses(data.unscheduledCourses || []);
        setUnscheduledFaculty(data.unscheduledFaculty || []);
        setUnscheduledRooms(data.unscheduledRooms || []);
      } else {
        toast.error(data.error || "Failed to load unscheduled summary");
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      {/* HEADER */}
      <div className="bg-[#493737] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <span className="text-lg font-semibold">Unscheduled Summary</span>
        <LogoutButton />
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* MAIN CARD */}
        <div className="bg-white p-6 rounded-xl border-l-4 border-[#d89860] shadow-sm">
          <h1 className="text-2xl font-semibold text-[#493737] mb-2">
            Unscheduled Overview
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            This page displays courses, faculty, and classrooms/labs that remain
            unscheduled after automatic timetable generation.
          </p>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin h-6 w-6 text-[#d89860]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Unscheduled Courses */}
              <div className="bg-gray-50 border rounded-xl p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-[#493737] mb-3 flex items-center gap-2">
                  <AlertTriangle className="text-[#d89860] w-5 h-5" /> Courses
                </h2>
                {unscheduledCourses.length > 0 ? (
                  <ul className="text-sm text-gray-700 space-y-2 max-h-64 overflow-auto">
                    {unscheduledCourses.map((c) => (
                      <li
                        key={c._id}
                        className="border-b pb-1 last:border-b-0 flex justify-between"
                      >
                        <span>
                          {c.code} - {c.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">All courses scheduled</p>
                )}
              </div>

              {/* Unscheduled Faculty */}
              <div className="bg-gray-50 border rounded-xl p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-[#493737] mb-3 flex items-center gap-2">
                  <AlertTriangle className="text-[#d89860] w-5 h-5" /> Faculty
                </h2>
                {unscheduledFaculty.length > 0 ? (
                  <ul className="text-sm text-gray-700 space-y-2 max-h-64 overflow-auto">
                    {unscheduledFaculty.map((f) => (
                      <li
                        key={f._id}
                        className="border-b pb-1 last:border-b-0 flex justify-between"
                      >
                        <span>
                          {f.name} ({f.designation})
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">
                    All faculty members scheduled
                  </p>
                )}
              </div>

              {/* Unscheduled Classrooms */}
              <div className="bg-gray-50 border rounded-xl p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-[#493737] mb-3 flex items-center gap-2">
                  <AlertTriangle className="text-[#d89860] w-5 h-5" />{" "}
                  Classrooms
                </h2>
                {unscheduledRooms.length > 0 ? (
                  <ul className="text-sm text-gray-700 space-y-2 max-h-64 overflow-auto">
                    {unscheduledRooms.map((r) => (
                      <li
                        key={r._id}
                        className="border-b pb-1 last:border-b-0 flex justify-between"
                      >
                        <span>
                          {r.name} (Capacity: {r.capacity})
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">
                    All classrooms/labs scheduled
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
