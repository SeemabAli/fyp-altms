"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface TimetableEntry {
  _id: string;
  courseId: { code: string; title: string };
  facultyId: { name: string; designation: string };
  roomId: { name: string; capacity: number; multimedia: boolean };
  day: string;
  slot: string;
}

export default function StudentTimetablePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await fetch("/api/student/timetable");
      const data = await res.json();
      if (res.ok) setTimetable(data.timetable || []);
      else toast.error(data.error || "Failed to load timetable");
    } catch {
      toast.error("Error fetching timetable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      {/* HEADER */}
      <div className="bg-[#493737] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <span className="text-lg font-semibold">My Timetable</span>
        <LogoutButton />
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl border-l-4 border-[#d89860] shadow-sm mb-6">
          <h1 className="text-2xl font-semibold text-[#493737] mb-2">
            Student Timetable
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            View your assigned courses and scheduled lecture timings.
          </p>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-[#493737]" size={24} />
            </div>
          ) : timetable.length === 0 ? (
            <p className="text-center text-gray-500 py-6">
              No schedule found. Please check after timetable generation.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full border-collapse">
                <thead className="bg-[#493737] text-white text-sm">
                  <tr>
                    <th className="px-4 py-3 text-left">Course</th>
                    <th className="px-4 py-3 text-left">Faculty</th>
                    <th className="px-4 py-3 text-left">Day</th>
                    <th className="px-4 py-3 text-left">Slot</th>
                    <th className="px-4 py-3 text-left">Room</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable.map((entry) => (
                    <tr
                      key={entry._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3">
                        {entry.courseId.code} - {entry.courseId.title}
                      </td>
                      <td className="px-4 py-3">
                        {entry.facultyId.name}{" "}
                        <span className="text-gray-500 text-sm">
                          ({entry.facultyId.designation})
                        </span>
                      </td>
                      <td className="px-4 py-3">{entry.day}</td>
                      <td className="px-4 py-3">{entry.slot}</td>
                      <td className="px-4 py-3">
                        {entry.roomId?.name}
                        <span className="text-gray-500 text-sm">
                          {" "}
                          ({entry.roomId?.multimedia ? "Multimedia" : "Basic"})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
