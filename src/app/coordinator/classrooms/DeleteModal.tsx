/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

export default function DeleteModal({ open, setOpen, selected, refresh }: any) {
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/coordinators/classrooms/${selected._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      toast.success("Classroom deleted");
      setOpen(false);
      refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-2xl shadow-2xl border border-red-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#493737]">
            Delete Classroom
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{" "}
          <b className="text-[#d89860]">{selected?.name}</b>? {/* ✅ FIXED */}
        </p>
        <DialogFooter className="gap-2">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
          >
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
