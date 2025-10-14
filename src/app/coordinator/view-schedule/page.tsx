"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import toast from "react-hot-toast";

interface Entry {
  _id: string;
  courseId: { code: string; title: string };
  facultyId: { name: string; designation: string };
  classroomId: { name: string };
  day: string;
  slot: string;
}

export default function ViewSchedulePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    try {
      const res = await fetch("/api/coordinators/view");
      const data = await res.json();
      if (res.ok) setEntries(data.schedule);
      else toast.error(data.error);
    } catch {
      toast.error("Failed to fetch schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      <div className="bg-[#493737] text-white px-6 py-4 flex justify-between items-center">
        <span className="text-lg font-semibold">View Schedule</span>
        <LogoutButton />
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-[#d89860] p-6">
          <h1 className="text-2xl font-semibold text-[#493737] mb-4">
            Generated Schedule
          </h1>

          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No schedule generated yet.
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-[#493737] text-white text-sm">
                <tr>
                  <th className="px-4 py-3 text-left">Course</th>
                  <th className="px-4 py-3 text-left">Faculty</th>
                  <th className="px-4 py-3 text-left">Room</th>
                  <th className="px-4 py-3 text-left">Day</th>
                  <th className="px-4 py-3 text-left">Slot</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">
                      {entry.courseId.code} - {entry.courseId.title}
                    </td>
                    <td className="px-4 py-3">
                      {entry.facultyId.name} ({entry.facultyId.designation})
                    </td>
                    <td className="px-4 py-3">{entry.classroomId.name}</td>
                    <td className="px-4 py-3">{entry.day}</td>
                    <td className="px-4 py-3">{entry.slot}</td>
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
