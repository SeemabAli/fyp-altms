/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["faculty", "student", "coordinator", "admin"]),
  designation: z
    .enum([
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Lecturer",
    ])
    .or(z.literal(""))
    .optional(),
});

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  selected: any;
  refresh: () => void;
}

export default function UserModal({ open, setOpen, selected, refresh }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "faculty",
    designation: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name || "",
        email: selected.email || "",
        role: selected.role || "faculty",
        designation: selected.designation || "",
      });
    } else {
      setForm({ name: "", email: "", role: "faculty", designation: "" });
    }
  }, [selected]);

  const handleCancel = () => {
    setOpen(false);
    if (selected) {
      setForm({
        name: selected.name || "",
        email: selected.email || "",
        role: selected.role || "faculty",
        designation: selected.designation || "",
      });
    } else {
      setForm({ name: "", email: "", role: "faculty", designation: "" });
    }
  };

  const handleSave = async () => {
    const parsed = userSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const method = selected ? "PUT" : "POST";
      const url = selected
        ? `/api/admin/users/${selected._id}`
        : "/api/admin/users";

      // Only send designation if role is faculty
      const payload: any = { ...form };
      if (form.role !== "faculty") delete payload.designation;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      let data = null;

      if (contentType && contentType.includes("application/json")) {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to save");
      }

      if (!selected) {
        toast.success(
          `User created! Password: ${data?.password || "Check email"}`
        );
      } else {
        toast.success("User updated successfully");
      }

      refresh();
      setOpen(false);
      if (!selected)
        setForm({ name: "", email: "", role: "faculty", designation: "" });
    } catch (e: any) {
      toast.error(e.message || "Error saving user");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-md overflow-visible">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#493737] to-[#5a4444] text-white rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {selected ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-gray-700 text-sm">
              Name *
            </Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter name"
              disabled={loading}
              className="border-gray-300 focus:border-[#d89860] focus:ring-[#d89860]/50"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-gray-700 text-sm">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter email"
              disabled={loading}
              className="border-gray-300 focus:border-[#d89860] focus:ring-[#d89860]/50"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="role" className="text-gray-700 text-sm">
              Role *
            </Label>
            <select
              id="role"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value, designation: "" })
              }
              disabled={loading}
              className="w-full border rounded-md px-3 py-2 border-gray-300 focus:border-[#d89860] focus:ring-[#d89860]/50"
            >
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
              <option value="coordinator">Coordinator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Faculty Designation */}
          {form.role === "faculty" && (
            <div className="space-y-1">
              <Label htmlFor="designation" className="text-gray-700 text-sm">
                Designation *
              </Label>
              <select
                id="designation"
                value={form.designation}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
                disabled={loading}
                className="w-full border rounded-md px-3 py-2 border-gray-300 focus:border-[#d89860] focus:ring-[#d89860]/50"
              >
                <option value="">Select designation</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-2">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
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
