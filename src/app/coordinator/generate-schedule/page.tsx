"use client";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function GenerateSchedulePage() {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coordinators/generate", { method: "POST" });
      const data = await res.json();
      if (res.ok) toast.success(data.message);
      else toast.error(data.error || "Failed to generate schedule");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      <div className="bg-[#493737] text-white px-6 py-4 flex justify-between items-center">
        <span className="text-lg font-semibold">Generate Schedule</span>
        <LogoutButton />
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-[#d89860] text-center">
          <h1 className="text-2xl font-semibold text-[#493737] mb-3">
            Automatic Schedule Generation
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            Click below to generate timetable based on faculty preferences, room
            capacity, and availability.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-[#d89860] hover:bg-[#c08850] text-white px-6 py-3 rounded-lg flex items-center justify-center mx-auto"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
            ) : (
              "Generate Schedule"
            )}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
