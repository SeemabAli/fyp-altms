/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import ScheduleDeleteModal from "./ScheduleDelete";
import { Loader2, Trash2, Calendar, Eye, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function GenerateSchedulePage() {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coordinators/generate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.error || data.message);
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      <header className="bg-[#493737] text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/VU_Logo.png/960px-VU_Logo.png"
              alt="VU Logo"
              className="w-8"
            />
          </div>
          <span className="font-semibold text-lg">
            Automated Timetable System
          </span>
        </div>
        <LogoutButton />
      </header>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero Card */}
          <div className="bg-white rounded-2xl shadow-xl border-t-4 border-[#d89860]">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-[#493737] to-[#5a4545] text-white px-8 py-10 text-center relative">
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="bg-[#d89860] p-4 rounded-full">
                    <Calendar className="w-10 h-10" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold mb-2">
                  Automatic Schedule Generation
                </h1>
                <p className="text-gray-200 max-w-xl mx-auto">
                  Generate timetables based on faculty preferences and room
                  availability
                </p>
              </div>
            </div>
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-[#d89860] hover:bg-[#c98750] text-white py-3 px-6 rounded-xl font-semibold shadow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <Calendar className="h-5 w-5" />
                  )}
                  <span>{loading ? "Generating..." : "Generate Schedule"}</span>
                </button>

                <Link
                  href="/coordinator/view-schedule"
                  className="bg-[#6b8e9f] hover:bg-[#5a7d8e] text-white py-3 px-6 rounded-xl font-semibold shadow flex items-center justify-center gap-2"
                >
                  <Eye className="h-5 w-5" />
                  <span>View Schedule</span>
                </Link>
              </div>

              <button
                onClick={() => setOpenDelete(true)}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-semibold shadow w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="h-5 w-5" />
                <span>Delete Existing Schedule</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ScheduleDeleteModal
        open={openDelete}
        setOpen={setOpenDelete}
        refresh={() => window.location.reload()}
      />
    </ProtectedRoute>
  );
}
