"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import { Loader2, User, Mail, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { DAYS, TIME_SLOTS, normalizeSlotString } from "@/lib/constants";

interface TimetableEntry {
  _id: string;
  courseId: {
    code: string;
    title: string;
    studentBatch?: string;
  };
  facultyId: { name: string; designation: string };
  roomId: { name: string; capacity: number; multimedia: boolean; type?: string };
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
  batch?: string;
};

type StudentSession = {
  user?: StudentUser;
};

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

  const getEntriesForDayAndSlot = (day: string, slotString: string) => {
    const target = normalizeSlotString(slotString);
    return timetable.filter((e) => {
      if (e.day !== day) return false;
      return normalizeSlotString(e.slot) === target;
    });
  };

  const getCardColor = (index: number) => {
    const colors = [
      "from-[#d89860] to-[#c88850]",
      "from-[#6b8e9f] to-[#5a7d8e]",
      "from-[#8b7ba8] to-[#7a6a97]",
    ];
    return colors[index % colors.length];
  };

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      {/* HEADER */}
      <div className="bg-[#493737] text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <span className="text-lg font-semibold tracking-wide">
          Student Portal – My Timetable
        </span>
        <LogoutButton />
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Student Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-[#d89860]">
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

                    <div className="flex flex-wrap items-center gap-4 text-gray-200 mt-1 text-sm">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4" /> {session.user.email}
                      </span>
                      {session.user.batch && (
                        <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          Batch: {session.user.batch}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="bg-[#d89860] p-4 rounded-full shadow-lg">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Student Dashboard</h2>
                    <p className="text-gray-200 text-sm mt-1">Loading profile...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timetable Schedule Grid */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-[#d89860]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#d89860] p-3 rounded-lg text-white">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#493737]">
                    Weekly Lecture Schedule
                  </h1>
                  <p className="text-sm text-gray-600">
                    {timetable.length}{" "}
                    {timetable.length === 1 ? "session" : "sessions"} scheduled for your batch
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2
                  className="animate-spin text-[#d89860] mb-4"
                  size={44}
                />
                <p className="text-gray-500">Loading your timetable...</p>
              </div>
            ) : timetable.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg font-medium">
                  No schedule available yet.
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Your timetable will appear here once the coordinator generates the schedule.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-[#493737] text-white">
                      <th className="border border-gray-300 px-4 py-3.5 text-left font-semibold w-28">
                        Weekday
                      </th>
                      {TIME_SLOTS.map((slot) => (
                        <th
                          key={slot.slotString}
                          className="border border-gray-300 px-3 py-3.5 text-center font-semibold text-xs tracking-wide"
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
                        className="hover:bg-gray-50/50 transition"
                      >
                        <td className="border border-gray-200 px-4 py-5 font-bold text-[#493737] bg-gray-50/80 align-top">
                          {day}
                        </td>
                        {TIME_SLOTS.map((slot) => {
                          const matching = getEntriesForDayAndSlot(
                            day,
                            slot.slotString
                          );
                          return (
                            <td
                              key={slot.slotString}
                              className="border border-gray-200 px-2 py-3 text-center align-top min-w-[190px]"
                            >
                              {matching.length > 0 ? (
                                <div className="space-y-2">
                                  {matching.map((entry, index) => (
                                    <div
                                      key={entry._id}
                                      className={`bg-gradient-to-br ${getCardColor(
                                        index
                                      )} text-white rounded-xl p-3 shadow-md text-left transition hover:shadow-lg`}
                                    >
                                      <div className="font-bold text-xs bg-black/20 px-2 py-0.5 rounded inline-block mb-1">
                                        {entry.courseId.code}
                                      </div>
                                      <div className="font-semibold text-xs leading-tight mb-1">
                                        {entry.courseId.title}
                                      </div>
                                      <div className="text-[11px] opacity-90">
                                        👨‍🏫 {entry.facultyId?.name}
                                      </div>
                                      <div className="text-[11px] opacity-80 mt-0.5 flex items-center justify-between">
                                        <span>📍 {entry.roomId?.name}</span>
                                        {entry.roomId?.type && (
                                          <span className="capitalize text-[10px] bg-white/20 px-1 rounded">
                                            {entry.roomId.type}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-300 text-lg font-light block py-5">
                                  —
                                </span>
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
