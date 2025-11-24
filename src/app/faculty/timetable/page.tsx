/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";

interface TimetableEntry {
  _id: string;
  day: string;
  slot: string;
  courseId?: {
    _id: string;
    code: string;
    title: string;
  };
  roomId?: {
    _id: string;
    name: string;
  };
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
        if (data.success) setTimetable(data.timetable || []);
      } catch (err) {
        console.error("Failed to fetch timetable:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const sortedTimetable = [...timetable].sort(
    (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
  );

  return (
    <ProtectedRoute allowedRoles={["faculty"]}>
      <div className="bg-[#3d2e2e] text-white px-6 py-4 flex flex-wrap items-center justify-between shadow-md">
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
        <LogoutButton />
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl mb-6 border-l-4 border-[#d89860] shadow-sm">
          <h1 className="text-2xl font-semibold text-[#3d2e2e]">
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

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Loading timetable...
            </div>
          ) : sortedTimetable.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No timetable available yet.
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#3d2e2e] text-white">
                  <th className="px-5 py-3 text-left font-semibold">Day</th>
                  <th className="px-5 py-3 text-left font-semibold">
                    Time Slot
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">Course</th>
                  <th className="px-5 py-3 text-left font-semibold">Room</th>
                </tr>
              </thead>
              <tbody>
                {sortedTimetable.map((entry, idx) => (
                  <tr
                    key={entry._id}
                    className={`border-b hover:bg-[#f9f6f3] transition ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#fdfaf7]"
                    }`}
                  >
                    <td className="px-5 py-3">{entry.day}</td>
                    <td className="px-5 py-3">{entry.slot}</td>
                    <td className="px-5 py-3">
                      {entry.courseId?.title || "—"}
                    </td>
                    <td className="px-5 py-3">{entry.roomId?.name || "—"}</td>
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
