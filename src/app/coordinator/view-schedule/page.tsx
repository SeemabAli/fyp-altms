"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import toast from "react-hot-toast";

interface Entry {
  _id: string;
  courseId: { code: string; title: string };
  facultyId: { name: string; designation: string };
  roomId: { name: string };
  day: string;
  slot: string | { start: string; end: string; slotIndex: number };
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SLOTS = [
  { display: "08:00am – 09:30am", start: "08:00", end: "09:30", index: 0 },
  { display: "09:30am – 11:00am", start: "09:30", end: "11:00", index: 1 },
  { display: "11:00am – 12:30pm", start: "11:00", end: "12:30", index: 2 },
  { display: "01:30pm – 03:00pm", start: "13:30", end: "15:00", index: 3 },
  { display: "03:00pm – 04:30pm", start: "15:00", end: "16:30", index: 4 },
];

export default function ViewSchedulePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");

  const fetchSchedule = async () => {
    try {
      const res = await fetch("/api/coordinators/view", { cache: "no-store" });
      const data = await res.json();

      if (res.ok && data.success) {
        setEntries(data.schedule);
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
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  // Get ALL entries for day and slot (not just one)
  const getEntriesForDayAndSlot = (day: string, start: string, end: string) => {
    return entries.filter((e) => {
      if (e.day !== day) return false;

      // If slot is an object (populated from Timeslot)
      if (typeof e.slot === "object" && e.slot !== null) {
        return e.slot.start === start && e.slot.end === end;
      }

      // If slot is a string, normalize and compare
      if (typeof e.slot === "string") {
        // Remove all spaces and convert to lowercase for comparison
        const normalizedSlot = e.slot.replace(/\s+/g, "").toLowerCase();
        const normalizedSearch = `${start}-${end}`
          .replace(/\s+/g, "")
          .toLowerCase();
        return normalizedSlot === normalizedSearch;
      }

      return false;
    });
  };

  // ✅ Function to get background color based on index
  const getCardColor = (index: number) => {
    if (index === 0) return "bg-[#d89860]"; // Original color for 1st entry
    if (index === 1) return "bg-[#6b8e9f]"; // Blue-grey for 2nd entry
    return "bg-[#8b7ba8]"; // Purple for 3rd+ entry
  };

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      {/* Header */}
      <div className="bg-[#493737] text-white px-6 py-4 flex justify-between items-center">
        <span className="text-lg font-semibold">View Schedule</span>
        <LogoutButton />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-[#d89860] p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-[#493737]">
              Generated Schedule{" "}
              <span className="text-base text-gray-500 font-normal">
                ({entries.length} entries)
              </span>
            </h1>
            <button
              onClick={fetchSchedule}
              className="bg-[#d89860] text-white px-6 py-2 rounded-md hover:bg-[#c98750] transition font-medium"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : message ? (
            <p className="text-gray-500 text-center py-8">{message}</p>
          ) : entries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No schedule generated yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
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
                    <tr key={day} className="hover:bg-gray-50">
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
                                    )} text-white rounded-lg p-3 min-h-[80px] flex flex-col justify-center`}
                                  >
                                    <div className="font-semibold text-sm mb-1">
                                      {entry.courseId.code} (
                                      {entry.courseId.title})
                                    </div>
                                    <div className="text-xs">
                                      {entry.facultyId?.name} –{" "}
                                      {entry.facultyId?.designation}
                                    </div>
                                    <div className="text-xs mt-1">
                                      Room: {entry.roomId?.name}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-2xl">—</span>
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
