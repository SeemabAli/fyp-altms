/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  selected: any;
  refresh: () => void;
}

export default function ClassroomModal({
  open,
  setOpen,
  selected,
  refresh,
}: Props) {
  const [form, setForm] = useState({
    classroomId: "",
    capacity: "",
    multimediaAvailable: false,
    building: "",
    availableSlots: [] as string[],
  });
  const [slotInput, setSlotInput] = useState("");

  useEffect(() => {
    if (selected) {
      setForm({
        classroomId: selected.classroomId || "",
        capacity: selected.capacity || "",
        multimediaAvailable: selected.multimediaAvailable || false,
        building: selected.building || "",
        availableSlots: selected.availableSlots || [],
      });
    } else {
      setForm({
        classroomId: "",
        capacity: "",
        multimediaAvailable: false,
        building: "",
        availableSlots: [],
      });
    }
  }, [selected]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addSlot = () => {
    if (!slotInput.trim()) return;
    setForm((prev) => ({
      ...prev,
      availableSlots: [...prev.availableSlots, slotInput.trim()],
    }));
    setSlotInput("");
  };

  const removeSlot = (slot: string) => {
    setForm((prev) => ({
      ...prev,
      availableSlots: prev.availableSlots.filter((s) => s !== slot),
    }));
  };

  const handleSubmit = async () => {
    try {
      const method = selected ? "PUT" : "POST";
      const url = selected
        ? `/api/coordinators/classrooms/${selected._id}`
        : "/api/coordinators/classrooms";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          capacity: Number(form.capacity),
          availableSlots:
            form.availableSlots.length > 0 ? form.availableSlots : ["ALL"],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      toast.success(selected ? "Classroom updated" : "Classroom added");
      setOpen(false);
      refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg rounded-2xl shadow-2xl border border-[#d89860]/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#493737]">
            {selected ? "Edit Classroom" : "Add Classroom"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Classroom ID */}
          <div>
            <Label className="font-semibold">Classroom ID</Label>
            <Input
              name="classroomId"
              value={form.classroomId}
              onChange={handleChange}
              className="mt-1 rounded-xl border-[#d89860]/40 focus:ring-[#d89860]"
              placeholder="e.g. B1-F0-01"
            />
          </div>

          {/* Building + Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Building</Label>
              <Input
                name="building"
                value={form.building}
                onChange={handleChange}
                className="mt-1 rounded-xl border-[#d89860]/40"
                placeholder="Block 1"
              />
            </div>
            <div>
              <Label className="font-semibold">Capacity</Label>
              <Input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                className="mt-1 rounded-xl border-[#d89860]/40"
                placeholder="70"
              />
            </div>
          </div>

          {/* Multimedia */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="multimediaAvailable"
              checked={form.multimediaAvailable}
              onChange={handleChange}
              className="h-4 w-4 accent-[#d89860]"
            />
            <Label className="font-semibold">Multimedia Available</Label>
          </div>

          {/* Available Slots */}
          <div>
            <Label className="font-semibold">Available Slots</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={slotInput}
                onChange={(e) => setSlotInput(e.target.value)}
                placeholder="e.g. 09:30am – 11:00am"
                className="rounded-xl border-[#d89860]/40"
              />
              <button
                onClick={addSlot}
                type="button"
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#d89860] to-[#e0a670] text-white text-sm"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.availableSlots.map((s, i) => (
                <span
                  key={i}
                  className="bg-[#d89860]/20 text-[#493737] rounded-xl px-2 py-1 cursor-pointer inline-flex items-center"
                  onClick={() => removeSlot(s)}
                >
                  {s} &nbsp;✕
                </span>
              ))}
              {form.availableSlots.length === 0 && (
                <span className="text-sm text-gray-500">Default: ALL</span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#d89860] to-[#e0a670] text-white font-semibold shadow-md"
          >
            {selected ? "Update Classroom" : "Add Classroom"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
