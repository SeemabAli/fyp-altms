"use client";
import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import toast from "react-hot-toast";
import { DAYS, TIME_SLOTS, normalizeSlotString } from "@/lib/constants";
import { RefreshCw, Layers, User, MapPin, Sparkles } from "lucide-react";

interface Entry {
  _id: string;
  courseId: {
    code: string;
    title: string;
    studentBatch?: string;
    creditHours?: number;
  };
  facultyId: {
    _id: string;
    name: string;
    designation: string;
  };
  roomId: {
    _id: string;
    name: string;
    type?: string;
    capacity?: number;
  };
  day: string;
  slot: string | { start: string; end: string; slotIndex: number };
}

interface FilterOptions {
  batches: string[];
  facultyList: Array<{ _id: string; name: string; designation?: string }>;
  roomList: Array<{ _id: string; name: string }>;
}

export default function ViewSchedulePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    batches: [],
    facultyList: [],
    roomList: [],
  });

  // Filter states
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<string>("all");

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBatch !== "all") params.append("batch", selectedBatch);
      if (selectedFaculty !== "all") params.append("facultyId", selectedFaculty);
      if (selectedRoom !== "all") params.append("roomId", selectedRoom);

      const res = await fetch(`/api/coordinators/view?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEntries(data.schedule || []);
        if (data.filterOptions) {
          setFilterOptions(data.filterOptions);
        }
        setMessage("");
      } else {
        setEntries([]);
        setMessage(data.message || data.error || "No schedule generated yet.");
      }
    } catch {
      toast.error("Failed to fetch schedule");
      setMessage("Error fetching schedule.");
    } finally {
      setLoading(false);
    }
  }, [selectedBatch, selectedFaculty, selectedRoom]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const resetFilters = () => {
    setSelectedBatch("all");
    setSelectedFaculty("all");
    setSelectedRoom("all");
  };

  const getEntriesForDayAndSlot = (day: string, slotString: string) => {
    const target = normalizeSlotString(slotString);
    return entries.filter((e) => {
      if (e.day !== day) return false;
      const entrySlot = normalizeSlotString(e.slot);
      return entrySlot === target;
    });
  };

  const getCardColor = (index: number) => {
    const colors = [
      "from-[#d89860] to-[#c88850]",
      "from-[#6b8e9f] to-[#5a7d8e]",
      "from-[#8b7ba8] to-[#7a6a97]",
      "from-[#5b8c6e] to-[#4a7b5d]",
    ];
    return colors[index % colors.length];
  };

  return (
    <ProtectedRoute allowedRoles={["coordinator", "admin"]}>
      {/* Top Navigation */}
      <div className="bg-[#493737] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-wide">
            Master Timetable View
          </span>
        </div>
        <LogoutButton />
      </div>

      <div className="max-w-[1500px] mx-auto p-6 space-y-6">
        {/* Filter Controls Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#493737] flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#d89860]" /> Weekly Master Schedule
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Showing {entries.length} scheduled session(s)
              </p>
            </div>

            <div className="flex items-center gap-3">
              {(selectedBatch !== "all" ||
                selectedFaculty !== "all" ||
                selectedRoom !== "all") && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-500 hover:text-[#493737] underline transition"
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={fetchSchedule}
                className="bg-[#d89860] hover:bg-[#c98750] text-white px-5 py-2.5 rounded-xl font-medium shadow transition flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            {/* Filter by Batch */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#d89860]" /> Student Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d89860]/30 transition"
              >
                <option value="all">All Batches</option>
                {filterOptions.batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Faculty */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#d89860]" /> Faculty Member
              </label>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d89860]/30 transition"
              >
                <option value="all">All Faculty</option>
                {filterOptions.facultyList.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} {f.designation ? `(${f.designation})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Room */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#d89860]" /> Room / Lab
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d89860]/30 transition"
              >
                <option value="all">All Classrooms & Labs</option>
                {filterOptions.roomList.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-gray-500">
              <RefreshCw className="animate-spin w-8 h-8 mx-auto text-[#d89860] mb-3" />
              <p>Loading timetable schedule...</p>
            </div>
          ) : message ? (
            <div className="py-20 text-center text-gray-500">
              <p className="text-lg">{message}</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p className="text-lg font-medium">No matching sessions found.</p>
              <p className="text-sm text-gray-400 mt-1">
                Try selecting a different filter or generate a new timetable.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-[#493737] text-white">
                    <th className="border border-gray-300 px-4 py-3.5 text-left font-semibold w-32">
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
                    <tr key={day} className="hover:bg-gray-50/50 transition">
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
                            className="border border-gray-200 px-2 py-3 text-center align-top min-w-[200px]"
                          >
                            {matching.length > 0 ? (
                              <div className="space-y-2">
                                {matching.map((entry, index) => (
                                  <div
                                    key={entry._id}
                                    className={`bg-gradient-to-br ${getCardColor(
                                      index
                                    )} text-white rounded-xl p-3 shadow text-left transition hover:shadow-md`}
                                  >
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span className="font-bold text-xs bg-black/20 px-2 py-0.5 rounded">
                                        {entry.courseId.code}
                                      </span>
                                      {entry.courseId.studentBatch && (
                                        <span className="text-[10px] font-medium bg-white/20 px-1.5 py-0.5 rounded">
                                          {entry.courseId.studentBatch}
                                        </span>
                                      )}
                                    </div>
                                    <div className="font-semibold text-xs leading-tight mb-1.5">
                                      {entry.courseId.title}
                                    </div>
                                    <div className="text-[11px] opacity-90">
                                      👨‍🏫 {entry.facultyId?.name}
                                    </div>
                                    <div className="text-[11px] opacity-90 mt-0.5 flex items-center justify-between">
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
                              <span className="text-gray-300 text-lg font-light block py-6">
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
    </ProtectedRoute>
  );
}
