/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import ClassroomModal from "./ClassroomModal";
import DeleteModal from "./DeleteModal";

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchClassrooms = async () => {
    const res = await fetch("/api/coordinators/classrooms", {
      cache: "no-store",
    });
    const json = await res.json();
    setClassrooms(json.data || []);
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-white via-gray-50 to-gray-100 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#493737]">Classrooms</h1>
        <button
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#d89860] to-[#e0a670] text-white font-semibold shadow-md"
        >
          + Add Classroom
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/90 rounded-2xl shadow-xl overflow-x-auto">
        <table className="min-w-full text-sm text-[#493737]">
          <thead className="bg-[#493737] text-white">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Room Code</th>
              <th className="px-4 py-3 text-left">Capacity</th>
              <th className="px-4 py-3 text-left">Building</th>
              <th className="px-4 py-3 text-left">Multimedia</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classrooms.map((c, idx) => (
              <tr
                key={c._id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">{idx + 1}</td>
                <td className="px-4 py-3 font-medium">{c.classroomId}</td>
                <td className="px-4 py-3">{c.capacity}</td>
                <td className="px-4 py-3">{c.building || "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      c.multimediaAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {c.multimediaAvailable ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => {
                      setSelected(c);
                      setOpen(true);
                    }}
                    className="p-2 rounded-lg bg-[#d89860]/20 hover:bg-[#d89860]/30 transition"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => {
                      setSelected(c);
                      setDeleteOpen(true);
                    }}
                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition"
                  >
                    <FiTrash2 className="text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <ClassroomModal
        open={open}
        setOpen={setOpen}
        selected={selected}
        refresh={fetchClassrooms}
      />
      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        selected={selected}
        refresh={fetchClassrooms}
      />
    </div>
  );
}
