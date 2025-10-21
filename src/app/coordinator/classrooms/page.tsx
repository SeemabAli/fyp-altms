/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import toast from "react-hot-toast";
import { Loader2, Plus, Edit, Trash2, Clock } from "lucide-react";
import DeleteModal from "./DeleteModal";

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
  createdAt: string;
}

export default function CoordinatorClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRoom, setNewRoom] = useState({
    name: "",
    capacity: "",
    type: "classroom",
    multimedia: false,
  });

  // new fields for structured naming
  const [buildingNo, setBuildingNo] = useState("");
  const [floorNo, setFloorNo] = useState("");
  const [roomNo, setRoomNo] = useState("");

  const [saving, setSaving] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(
    null
  );

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

  const resetForm = () => {
    setNewRoom({
      name: "",
      capacity: "",
      type: "classroom",
      multimedia: false,
    });
    setBuildingNo("");
    setFloorNo("");
    setRoomNo("");
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!buildingNo || !floorNo || !roomNo || !newRoom.capacity) {
      toast.error("Please fill all required fields");
      return;
    }

    // generate name automatically
    const generatedName = `B${buildingNo}-F${floorNo}-R${roomNo}`;

    setSaving(true);
    try {
      const url = `/api/coordinators/classrooms`;
      const method = editingId ? "PUT" : "POST";

      const body = editingId
        ? {
            id: editingId,
            name: generatedName,
            capacity: Number(newRoom.capacity),
            type: newRoom.type,
            multimedia: newRoom.multimedia,
          }
        : {
            name: generatedName,
            capacity: Number(newRoom.capacity),
            type: newRoom.type,
            multimedia: newRoom.multimedia,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editingId ? "Classroom updated" : "Classroom added");
        resetForm();
        fetchClassrooms();
      } else {
        toast.error(data.error || "Failed to save classroom");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (classroom: Classroom) => {
    setNewRoom({
      name: classroom.name,
      capacity: String(classroom.capacity),
      type: classroom.type,
      multimedia: classroom.multimedia,
    });

    // auto-extract numbers if name format matches B1-F2-R8
    const match = classroom.name.match(/B(\d+)-F(\d+)-R(\d+)/);
    if (match) {
      setBuildingNo(match[1]);
      setFloorNo(match[2]);
      setRoomNo(match[3]);
    } else {
      setBuildingNo("");
      setFloorNo("");
      setRoomNo("");
    }

    setEditingId(classroom._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (room: Classroom) => {
    setSelectedClassroom(room);
    setOpenDelete(true);
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
          <span className="text-lg font-semibold">
            Automated Timetable System
          </span>
        </div>
        <LogoutButton />
      </div>

      {/* MAIN */}
      <div className="max-w-6xl mx-auto p-6">
        {/* TITLE */}
        <div className="bg-white p-6 rounded-xl mb-6 border-l-4 shadow-sm border-[#d89860] flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-[#493737]">
              Classrooms & Labs
            </h1>
            <p className="text-sm text-gray-600">
              Add and manage available classrooms and labs with time slots.
            </p>
          </div>
        </div>

        {/* FORM */}
        {/* FORM */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-[#493737] mb-4 flex items-center gap-2">
            <Plus className="text-[#d89860]" />
            {editingId ? "Edit Room" : "Add New Room"}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Building / Floor / Room */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Building No
              </label>
              <input
                type="number"
                placeholder="Enter building no"
                className="border rounded-lg px-3 py-2 w-full"
                value={buildingNo}
                onChange={(e) => {
                  const value = Math.abs(Number(e.target.value));
                  setBuildingNo(value ? value.toString() : "");
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Floor No
              </label>
              <input
                type="number"
                placeholder="Enter floor no"
                className="border rounded-lg px-3 py-2 w-full"
                value={floorNo}
                onChange={(e) => {
                  const value = Math.abs(Number(e.target.value));
                  setFloorNo(value ? value.toString() : "");
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Room No
              </label>
              <input
                type="number"
                placeholder="Enter room no"
                className="border rounded-lg px-3 py-2 w-full"
                value={roomNo}
                onChange={(e) => {
                  const value = Math.abs(Number(e.target.value));
                  setRoomNo(value ? value.toString() : "");
                }}
              />
            </div>

            {/* Capacity */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Capacity
              </label>
              <input
                type="number"
                placeholder="Enter capacity"
                className="border rounded-lg px-3 py-2"
                value={newRoom.capacity}
                onChange={(e) => {
                  const value = Math.abs(Number(e.target.value));
                  setNewRoom({ ...newRoom, capacity: value.toString() });
                }}
              />
            </div>

            {/* Type */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                className="border rounded-lg px-3 py-2"
                value={newRoom.type}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, type: e.target.value })
                }
              >
                <option value="classroom">Classroom</option>
                <option value="lab">Lab</option>
              </select>
            </div>

            {/* Multimedia */}
            <div className="flex flex-col gap-2 justify-end">
              <label className="text-sm font-medium text-gray-700">
                Multimedia
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newRoom.multimedia}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, multimedia: e.target.checked })
                  }
                />
                Available
              </label>
            </div>
          </div>

          {/* Preview the generated name */}
          {buildingNo && floorNo && roomNo && (
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-semibold text-[#493737]">
                B{buildingNo}-F{floorNo}-R{roomNo}
              </span>
            </p>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-[#d89860] hover:bg-[#c08850] text-white px-6 py-2 rounded-lg transition flex items-center justify-center"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : editingId ? (
                "Update Room"
              ) : (
                "Add Room"
              )}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-[#493737] text-white text-sm">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Capacity</th>
                <th className="px-4 py-3 text-left">Multimedia</th>
                <th className="px-4 py-3 text-left">Time Slots</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    Loading rooms...
                  </td>
                </tr>
              ) : classrooms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No rooms found.
                  </td>
                </tr>
              ) : (
                classrooms.map((room) => (
                  <tr
                    key={room._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{room.name}</td>
                    <td className="px-4 py-3 capitalize">{room.type}</td>
                    <td className="px-4 py-3">{room.capacity}</td>
                    <td className="px-4 py-3">
                      {room.multimedia ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="w-4 h-4" />
                        {room.timeSlots?.length || 0} slots
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {room.timeSlots && room.timeSlots.length > 0 && (
                          <>
                            {room.timeSlots[0].startTime} -{" "}
                            {room.timeSlots[room.timeSlots.length - 1].endTime}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(room)}
                          className="text-[#d89860] hover:text-[#c08850]"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(room)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedClassroom && (
        <DeleteModal
          open={openDelete}
          setOpen={setOpenDelete}
          selected={selectedClassroom}
          refresh={fetchClassrooms}
        />
      )}
    </ProtectedRoute>
  );
}
