/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, X } from "lucide-react";
import { z } from "zod";

const courseSchema = z.object({
  code: z.string().min(2, "Course code is required (e.g., CS201)"),
  title: z.string().min(3, "Course title is required"),
  enrollment: z.number().min(1, "Enrollment must be at least 1"),
  multimediaRequired: z.boolean(),
  studentBatch: z.string().optional().nullable(),
});

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  selected: any;
  refresh: () => void;
}

export default function CourseModal({
  open,
  setOpen,
  selected,
  refresh,
}: Props) {
  const [form, setForm] = useState({
    code: "",
    title: "",
    enrollment: "",
    multimediaRequired: false,
    studentBatch: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selected) {
      setForm({
        code: selected.code || "",
        title: selected.title || "",
        enrollment: selected.enrollment?.toString() || "",
        multimediaRequired: !!selected.multimediaRequired,
        studentBatch: selected.studentBatch || "",
      });
    } else {
      setForm({
        code: "",
        title: "",
        enrollment: "",
        multimediaRequired: false,
        studentBatch: "",
      });
    }
  }, [selected]);

  const handleSave = async () => {
    const payload = {
      code: form.code.toUpperCase().trim(),
      title: form.title.trim(),
      enrollment: parseInt(form.enrollment || "0", 10) || 0,
      multimediaRequired: form.multimediaRequired,
      studentBatch: form.studentBatch?.trim() || undefined,
    };

    const parsed = courseSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const method = selected ? "PUT" : "POST";
      const url = selected
        ? `/api/coordinators/courses/${selected._id}`
        : "/api/coordinators/courses";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data?.error ||
            data?.message ||
            `Failed to ${selected ? "update" : "create"} course`
        );

      toast.success(`Course ${selected ? "updated" : "created"} successfully`);
      refresh();
      setOpen(false);
    } catch (err: any) {
      console.error("save course error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#493737] to-[#5a4444] text-white rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {selected ? "Edit Course" : "Add New Course"}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-6 space-y-4">
          <div className="space-y-1">
            <Label>Course Code *</Label>
            <Input
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              placeholder="e.g., CS201"
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Data Structures"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Student Batch (optional)</Label>
              <Input
                value={form.studentBatch}
                onChange={(e) =>
                  setForm({ ...form, studentBatch: e.target.value })
                }
                placeholder="e.g., BSCS-6A"
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <Label>Student Enrollment *</Label>
              <Input
                type="number"
                min={1}
                value={form.enrollment}
                onChange={(e) =>
                  setForm({ ...form, enrollment: e.target.value })
                }
                placeholder="e.g., 85"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Multimedia Requirement</Label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="multimedia"
                  checked={form.multimediaRequired === true}
                  onChange={() =>
                    setForm({ ...form, multimediaRequired: true })
                  }
                  disabled={loading}
                />
                <span className="text-sm">Requires multimedia classroom</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="multimedia"
                  checked={form.multimediaRequired === false}
                  onChange={() =>
                    setForm({ ...form, multimediaRequired: false })
                  }
                  disabled={loading}
                />
                <span className="text-sm">Standard classroom is fine</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-[#d89860] to-[#e0a670] text-white px-4 py-2 rounded-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 transition"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
