/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import { Loader2, Trash2, Calendar, Eye, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ScheduleDeleteModal from "./ScheduleDelete";

export default function GenerateSchedulePage() {
  const [loading, setLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
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

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      {/* HEADER */}
      <header className="bg-[#493737] text-white px-6 py-4 flex flex-wrap items-center justify-between shadow-lg">
        <div className="flex items-center gap-3 min-w-[200px] mb-2 sm:mb-0">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-md">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/VU_Logo.png/960px-VU_Logo.png"
              alt="VU Logo"
              className="w-8 h-auto"
            />
          </div>
          <span className="text-lg font-semibold tracking-wide">
            Automated Timetable System
          </span>
        </div>
        <LogoutButton />
      </header>

      {/* MAIN */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-[#d89860]">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#493737] to-[#5a4545] text-white px-8 py-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20"></div>
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-[#d89860] p-4 rounded-full shadow-lg">
                    <Calendar className="w-10 h-10" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold mb-3 tracking-tight">
                  Automatic Schedule Generation
                </h1>
                <p className="text-lg text-gray-200 max-w-2xl mx-auto">
                  Intelligently generate timetables based on faculty preferences and room availability
                </p>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 md:p-12">
              {/* Info Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="bg-gradient-to-br from-[#d89860]/10 to-[#d89860]/5 rounded-xl p-6 border border-[#d89860]/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#d89860] p-2 rounded-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-[#493737]">Smart Algorithm</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Automatically assigns courses based on faculty preferences and constraints
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#6b8e9f]/10 to-[#6b8e9f]/5 rounded-xl p-6 border border-[#6b8e9f]/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#6b8e9f] p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-[#493737]">Conflict-Free</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Prevents room and faculty scheduling conflicts automatically
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#8b7ba8]/10 to-[#8b7ba8]/5 rounded-xl p-6 border border-[#8b7ba8]/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#8b7ba8] p-2 rounded-lg">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-[#493737]">Easy Review</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    View and verify the generated schedule in a clean interface
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="group relative bg-gradient-to-r from-[#d89860] to-[#e0a670] hover:from-[#c98750] hover:to-[#d89860] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="relative flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin h-6 w-6" />
                          <span className="text-lg">Generating Schedule...</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="h-6 w-6" />
                          <span className="text-lg">Generate Schedule</span>
                        </>
                      )}
                    </div>
                  </button>

                  {/* View Schedule Button */}
                  <Link
                    href="/coordinator/view-schedule"
                    className="group relative bg-gradient-to-r from-[#6b8e9f] to-[#7a9fb0] hover:from-[#5a7d8e] hover:to-[#6b8e9f] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="relative flex items-center justify-center gap-3">
                      <Eye className="h-6 w-6" />
                      <span className="text-lg">View Schedule</span>
                    </div>
                  </Link>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => setOpenDelete(true)}
                  disabled={deleting}
                  className="group w-full relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    <Trash2 className="h-6 w-6" />
                    <span className="text-lg">Delete Existing Schedule</span>
                  </div>
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-[#493737] mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#d89860] rounded-full"></span>
                  How it works
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#d89860] font-bold">1.</span>
                    <span>Click &quot;Generate Schedule&quot; to automatically create a timetable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6b8e9f] font-bold">2.</span>
                    <span>Review the generated schedule using &quot;View Schedule&quot;</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">3.</span>
                    <span>Delete and regenerate if needed to refine the schedule</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ScheduleDeleteModal
        open={openDelete}
        setOpen={setOpenDelete}
        refresh={() => window.location.reload()}
      />
    </ProtectedRoute>
  );
}