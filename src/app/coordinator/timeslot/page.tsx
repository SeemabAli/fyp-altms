/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import toast from "react-hot-toast";
import { Loader2, Clock, AlertCircle } from "lucide-react";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface Classroom {
  _id: string;
  name: string;
  capacity: number;
  type: string;
  multimedia: boolean;
  timeSlots: TimeSlot[];
}

interface ClassroomBooking {
  classroomId: string;
  classroomName: string;
  selectedSlots: string[];
  capacity: number;
  multimedia: boolean;
}

export default function TimeSlotSelectionPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookings, setSelectedBookings] = useState<ClassroomBooking[]>(
    []
  );
  const [requiresMultimedia, setRequiresMultimedia] = useState(false);
  const [requiredCapacity, setRequiredCapacity] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchClassrooms = async () => {
    try {
      const res = await fetch("/api/coordinators/classrooms");
      const data = await res.json();
      if (res.ok) setClassrooms(data.classrooms);
      else toast.error(data.error || "Failed to fetch classrooms");
    } catch {
      toast.error("Failed to fetch classrooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  // Filter classrooms based on requirements
  const filteredClassrooms = classrooms.filter((room) => {
    if (requiredCapacity && room.capacity < Number(requiredCapacity))
      return false;
    if (requiresMultimedia && !room.multimedia) return false;
    return true;
  });

  // Toggle time slot selection
  const toggleSlotSelection = (classroomId: string, startTime: string) => {
    setSelectedBookings((prev) => {
      const existing = prev.find((b) => b.classroomId === classroomId);
      const classroom = classrooms.find((c) => c._id === classroomId)!;

      if (existing) {
        const updatedSlots = existing.selectedSlots.includes(startTime)
          ? existing.selectedSlots.filter((s) => s !== startTime)
          : [...existing.selectedSlots, startTime];

        if (updatedSlots.length === 0) {
          return prev.filter((b) => b.classroomId !== classroomId);
        }

        return prev.map((b) =>
          b.classroomId === classroomId
            ? { ...b, selectedSlots: updatedSlots }
            : b
        );
      } else {
        return [
          ...prev,
          {
            classroomId,
            classroomName: classroom.name,
            selectedSlots: [startTime],
            capacity: classroom.capacity,
            multimedia: classroom.multimedia,
          },
        ];
      }
    });
  };

  const isSlotSelected = (classroomId: string, startTime: string) => {
    return selectedBookings
      .find((b) => b.classroomId === classroomId)
      ?.selectedSlots.includes(startTime);
  };

  const handleSaveBookings = async () => {
    if (selectedBookings.length === 0) {
      toast.error("Please select at least one time slot");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/coordinators/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookings: selectedBookings,
          requiresMultimedia,
          requiredCapacity: Number(requiredCapacity),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Time slots booked successfully");
        setSelectedBookings([]);
        setRequiresMultimedia(false);
        setRequiredCapacity("");
      } else {
        toast.error(data.error || "Failed to book time slots");
      }
    } catch {
      toast.error("Failed to save bookings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      {/* HEADER */}
      <div className="bg-[#493737] text-white px-6 py-4 flex flex-wrap items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/VU_Logo.png/960px-VU_Logo.png"
              alt="VU Logo"
              className="w-8 h-auto"
            />
          </div>
          <span className="text-lg font-semibold">Time Slot Selection</span>
        </div>
        <LogoutButton />
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto p-6">
        {/* TITLE */}
        <div className="bg-white p-6 rounded-xl mb-6 border-l-4 shadow-sm border-[#d89860]">
          <h1 className="text-2xl font-semibold text-[#493737]">
            Book Classroom Time Slots
          </h1>
          <p className="text-sm text-gray-600">
            Select classrooms and available time slots for your courses.
          </p>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-[#493737] mb-4">Filters</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Capacity
              </label>
              <input
                type="number"
                placeholder="e.g., 50"
                className="w-full border rounded-lg px-3 py-2"
                value={requiredCapacity}
                onChange={(e) => setRequiredCapacity(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresMultimedia}
                  onChange={(e) => setRequiresMultimedia(e.target.checked)}
                />
                <span className="font-medium text-gray-700">
                  Multimedia Required
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* CLASSROOMS */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#d89860]" />
          </div>
        ) : filteredClassrooms.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border-l-4 border-yellow-500 flex items-gap-4">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                No classrooms found matching your filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClassrooms.map((classroom) => (
              <div
                key={classroom._id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#493737]">
                      {classroom.name}
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                      <span>
                        📍{" "}
                        {classroom.type.charAt(0).toUpperCase() +
                          classroom.type.slice(1)}
                      </span>
                      <span>👥 Capacity: {classroom.capacity}</span>
                      {classroom.multimedia && (
                        <span>🎬 Multimedia Available</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>
                      {selectedBookings.find(
                        (b) => b.classroomId === classroom._id
                      )?.selectedSlots.length || 0}{" "}
                      selected
                    </div>
                  </div>
                </div>

                {/* TIME SLOTS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {classroom.timeSlots?.map((slot) => {
                    const isSelected = isSlotSelected(
                      classroom._id,
                      slot.startTime
                    );
                    return (
                      <button
                        key={slot.startTime}
                        onClick={() =>
                          toggleSlotSelection(classroom._id, slot.startTime)
                        }
                        className={`p-3 rounded-lg border-2 transition font-medium text-sm flex items-center justify-center gap-2 ${
                          isSelected
                            ? "border-[#d89860] bg-[#d89860] text-white"
                            : "border-gray-300 bg-gray-50 text-gray-700 hover:border-[#d89860]"
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        {slot.startTime}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SELECTED SUMMARY */}
        {selectedBookings.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-6 border-l-4 border-[#d89860] max-w-sm">
            <h3 className="font-semibold text-[#493737] mb-3">
              Selected:{" "}
              {selectedBookings.reduce(
                (sum, b) => sum + b.selectedSlots.length,
                0
              )}{" "}
              slots
            </h3>
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto text-sm text-gray-600">
              {selectedBookings.map((booking) => (
                <div key={booking.classroomId}>
                  <p className="font-medium text-[#493737]">
                    {booking.classroomName}
                  </p>
                  <p className="text-xs">
                    {booking.selectedSlots.length} slot(s) selected
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={handleSaveBookings}
              disabled={saving}
              className="w-full bg-[#d89860] hover:bg-[#c08850] text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Confirm Bookings"
              )}
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
