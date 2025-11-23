/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import toast from "react-hot-toast";
import { X } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  selected: any;
  refresh: () => void;
}

export default function DeleteModal({
  open,
  setOpen,
  selected,
  refresh,
}: Props) {
  const [deleting, setDeleting] = useState(false);

  if (!open) return null;

  const handleDelete = async () => {
    if (!selected?._id) {
      toast.error("No course selected");
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/coordinators/courses/${selected._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data?.error || data?.message || "Failed to delete course"
        );

      toast.success("Course deleted successfully");
      refresh();
      setOpen(false);
    } catch (e: any) {
      console.error("delete course error:", e);
      toast.error(e.message || "Error deleting course");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-md overflow-visible">
        <div className="bg-gradient-to-r from-[#493737] to-[#5a4444] text-white rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Delete Course</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="px-6 py-6 text-gray-700 text-sm">
          Are you sure you want to delete{" "}
          <b className="text-[#493737]">
            {selected?.code} — {selected?.title}
          </b>
          ?
        </div>

        <div className="px-6 pb-6">
          <div className="mt-3 p-3 bg-red-50 rounded-md text-sm text-red-800">
            <strong>Warning:</strong> This action cannot be undone.
            {!!selected?.enrollment && (
              <span>
                {" "}
                It will affect {selected.enrollment} enrolled students.
              </span>
            )}
          </div>
        </div>
        <div className="px-6 py-4 flex justify-end gap-2">
          <button
            onClick={() => setOpen(false)}
            disabled={deleting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
