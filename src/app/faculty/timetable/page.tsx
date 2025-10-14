/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";

interface TimetableEntry {
  _id: string;
  courseCode: string;
  courseTitle: string;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
  batch?: string;
}

export default function FacultyTimetable() {
  const { data: session } = useSession();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await fetch("/api/faculty/timetable");
        const data = await res.json();
        setTimetable(data.timetable || []);
      } catch {
        console.error("Failed to fetch timetable");
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["faculty"]}>
      {/* HEADER */}
      <div className="bg-[#493737] text-white px-6 py-4 flex flex-wrap items-center justify-between shadow-md">
        <div className="flex items-center gap-3 min-w-[200px] mb-2 sm:mb-0">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/VU_Logo.png/960px-VU_Logo.png"
              alt="VU Logo"
              className="w-8 h-auto"
            />
          </div>
          <span className="text-lg font-semibold">
            Automated Timetable System
          </span>
        </div>
        <button className="px-4 py-2 rounded text-sm">
          <LogoutButton />
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl mb-6 border-l-4 shadow-sm border-[#d89860]">
          <h1 className="text-2xl font-semibold text-[#493737]">
            My Timetable
          </h1>
          <p className="text-sm text-gray-600">
            View your scheduled lectures and assigned rooms.
          </p>
          {session?.user?.name && (
            <p className="text-sm text-gray-500 mt-1">
              Logged in as{" "}
              <span className="font-medium">{session.user.name}</span> (
              {session.user.email})
            </p>
          )}
        </div>

        {/* Timetable Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Loading timetable...
            </div>
          ) : timetable.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No timetable available yet.
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-[#493737] text-white text-sm">
                <tr>
                  <th className="px-4 py-3 text-left">Day</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Course</th>
                  <th className="px-4 py-3 text-left">Room</th>
                  <th className="px-4 py-3 text-left">Batch</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((entry) => (
                  <tr
                    key={entry._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">{entry.day}</td>
                    <td className="px-4 py-3">
                      {entry.startTime} - {entry.endTime}
                    </td>
                    <td className="px-4 py-3">
                      {entry.courseCode} — {entry.courseTitle}
                    </td>
                    <td className="px-4 py-3">{entry.room}</td>
                    <td className="px-4 py-3">{entry.batch || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
