"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import { Loader2, User, Mail, Calendar } from "lucide-react";
import toast from "react-hot-toast";

interface TimetableEntry {
  _id: string;
  courseId: { code: string; title: string };
  facultyId: { name: string; designation: string };
  roomId: { name: string; capacity: number; multimedia: boolean };
  day: string;
  slot: string;
}

type StudentUser = {
  id: string;
  role: "admin" | "coordinator" | "faculty" | "student";
  name?: string | null;
  email?: string | null;
  image?: string | null;
  designation?: string | null;
};

type StudentSession = {
  user?: StudentUser;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SLOTS = [
  { display: "08:00am – 09:30am", start: "08:00", end: "09:30", index: 0 },
  { display: "09:30am – 11:00am", start: "09:30", end: "11:00", index: 1 },
  { display: "11:00am – 12:30pm", start: "11:00", end: "12:30", index: 2 },
  { display: "01:30pm – 03:00pm", start: "13:30", end: "15:00", index: 3 },
  { display: "03:00pm – 04:30pm", start: "15:00", end: "16:30", index: 4 },
];

export default function StudentTimetablePage() {
  const { data: session } = useSession() as {
    data: StudentSession | null;
  };
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

  const getEntriesForDayAndSlot = (day: string, start: string, end: string) => {
    return timetable.filter((e) => {
      if (e.day !== day) return false;

      if (typeof e.slot === "string") {
        const normalizedSlot = e.slot.replace(/\s+/g, "").toLowerCase();
        const normalizedSearch = `${start}-${end}`
          .replace(/\s+/g, "")
          .toLowerCase();
        return normalizedSlot === normalizedSearch;
      }

      return false;
    });
  };

  const getCardColor = (index: number) => {
    if (index === 0) return "bg-[#d89860]";
    if (index === 1) return "bg-[#6b8e9f]";
    return "bg-[#8b7ba8]";
  };

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      {/* HEADER */}
      <div className="bg-[#493737] text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <span className="text-lg font-semibold">My Timetable</span>
        <LogoutButton />
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-[#d89860] mb-6">
            <div className="bg-gradient-to-r from-[#493737] to-[#5a4545] text-white px-8 py-6">
              {session?.user?.name ? (
                <div className="flex items-center gap-4">
                  <div className="bg-[#d89860] p-4 rounded-full shadow-lg">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {session.user.name
                        .split(" ")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </h2>

                    <div className="flex items-center gap-2 text-gray-200 mt-1">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{session.user.email}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="bg-[#d89860] p-4 rounded-full shadow-lg">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Student</h2>
                    <p className="text-gray-200 text-sm mt-1">Loading...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-[#d89860]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#d89860] p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#493737]">
                    Weekly Schedule
                  </h1>
                  <p className="text-sm text-gray-600">
                    {timetable.length}{" "}
                    {timetable.length === 1 ? "class" : "classes"} scheduled
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2
                  className="animate-spin text-[#d89860] mb-4"
                  size={48}
                />
                <p className="text-gray-500">Loading your timetable...</p>
              </div>
            ) : timetable.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  No schedule found
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Your timetable will appear here after generation
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-[#493737] text-white">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                        Weekday
                      </th>
                      {SLOTS.map((slot) => (
                        <th
                          key={slot.display}
                          className="border border-gray-300 px-4 py-3 text-center font-semibold text-sm"
                        >
                          {slot.display}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day) => (
                      <tr
                        key={day}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="border border-gray-300 px-4 py-6 font-semibold text-[#493737] bg-gray-50">
                          {day}
                        </td>
                        {SLOTS.map((slot) => {
                          const matchingEntries = getEntriesForDayAndSlot(
                            day,
                            slot.start,
                            slot.end
                          );
                          return (
                            <td
                              key={slot.display}
                              className="border border-gray-300 px-3 py-4 text-center align-middle"
                            >
                              {matchingEntries.length > 0 ? (
                                <div className="space-y-2">
                                  {matchingEntries.map((entry, index) => (
                                    <div
                                      key={entry._id}
                                      className={`${getCardColor(
                                        index
                                      )} text-white rounded-lg p-3 min-h-[90px] flex flex-col justify-center shadow-md hover:shadow-lg transition-shadow`}
                                    >
                                      <div className="font-bold text-sm mb-1">
                                        {entry.courseId.code}
                                      </div>
                                      <div className="text-xs opacity-90 mb-1">
                                        {entry.courseId.title}
                                      </div>
                                      <div className="text-xs opacity-90">
                                        <span>
                                          {entry.facultyId?.designation}
                                          {"  "}
                                          {entry.facultyId?.name}
                                        </span>
                                      </div>
                                      <div className="text-xs opacity-75 mt-1 flex items-center justify-center gap-1">
                                        <span>Room:</span>
                                        {entry.roomId?.name}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-300 text-2xl font-light">
                                  —
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
