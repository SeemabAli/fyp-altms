"use client";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import { Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function GenerateSchedulePage() {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coordinators/generate", { method: "POST" });
      const data = await res.json();
      if (data.success) toast.success(data.message);
      else toast.error(data.error || data.message);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete all generated schedules?"))
      return;
    setDeleting(true);
    try {
      const res = await fetch("/api/coordinators/generate", {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) toast.success(data.message);
      else toast.error(data.message || "Failed to delete");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      {/* HEADER */}
      <div className="bg-[#493737] text-white px-6 py-4 flex justify-between items-center">
        <span className="text-lg font-semibold">Generate Schedule</span>
        <LogoutButton />
      </div>

      {/* MAIN */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-[#d89860] text-center">
          <h1 className="text-2xl font-semibold text-[#493737] mb-3">
            Automatic Schedule Generation
          </h1>
          <p className="text-sm text-gray-600 mb-5">
            Click below to generate timetable based on faculty preferences,
            avoiding duplicates. You can also delete the existing schedule.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-[#d89860] hover:bg-[#c08850] text-white px-6 py-3 rounded-lg flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />{" "}
                  Generating...
                </>
              ) : (
                "Generate Schedule"
              )}
            </button>

            <Link
              href="/coordinator/view-schedule"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center"
            >
              View Schedule
            </Link>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center justify-center"
            >
              {deleting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-5 w-5" /> Delete Schedule
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
