/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import toast from "react-hot-toast";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  selected: any;
  refresh: () => void;
}

export default function UserDeleteModal({ open, setOpen, selected, refresh }: Props) {
  const handleDelete = async () => {
    if (!selected?._id) return toast.error("No user selected");

    try {
      const res = await fetch(`/api/admin/users/${selected._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      toast.success("User deleted successfully");
      refresh();
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Error deleting user");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-md overflow-visible">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#493737] to-[#5a4444] text-white rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Delete User</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 text-gray-700 text-sm">
          Are you sure you want to delete <b>{selected?.name}</b>?
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-2">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:shadow-lg transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
