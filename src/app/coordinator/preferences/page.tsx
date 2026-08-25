/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import BackButton from "@/components/BackButton";
import { Clock } from "lucide-react";
import toast from "react-hot-toast";
import DeletePreferenceModal from "./DeletePreferenceModal";

interface FacultyPreference {
  _id: string;
  facultyId: {
    name: string;
    email: string;
    designation: string;
  };
  courses: { _id: string; code: string; title: string }[];
  timestamp: string;
}

export default function CoordinatorPreferencesPage() {
  const [preferences, setPreferences] = useState<FacultyPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPreference, setSelectedPreference] =
    useState<FacultyPreference | null>(null);

  const fetchPreferences = async () => {
    try {
      const res = await fetch("/api/coordinators/preferences");
      const data = await res.json();
      if (res.ok) {
        setPreferences(data.preferences || []);
      } else {
        toast.error(data.error || "Failed to fetch");
      }
    } catch {
      toast.error("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleDeleteClick = (pref: FacultyPreference) => {
    setSelectedPreference(pref);
    setDeleteModalOpen(true);
  };

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      <div className="bg-[#493737] text-white px-6 py-4 flex flex-wrap items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <BackButton fallbackUrl="/coordinator/dashboard" />
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/VU_Logo.png/960px-VU_Logo.png"
              alt="VU Logo"
              className="w-7"
            />
          </div>
          <span className="text-lg font-semibold">
            Automated Timetable System
          </span>
        </div>
        <LogoutButton />
      </div>

      <div className="min-h-screen p-6 bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#493737] mb-2">
              Faculty Preferences
            </h1>
            <p className="text-gray-600">
              Review all submitted faculty course preferences with timestamps
              and designations.
            </p>
          </div>

          <div className="bg-white/90 rounded-2xl shadow-xl overflow-x-auto">
            <table className="w-full text-sm text-[#493737]">
              <thead className="bg-[#493737] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Faculty Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Designation</th>
                  <th className="px-4 py-3 text-left">Preferred Courses</th>
                  <th className="px-4 py-3 text-left">Submitted At</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      Loading preferences...
                    </td>
                  </tr>
                ) : preferences.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      No preferences submitted yet.
                    </td>
                  </tr>
                ) : (
                  preferences.map((pref, idx) => (
                    <tr
                      key={pref._id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4">{idx + 1}</td>
                      <td className="px-4 py-4 font-medium">
                        {pref.facultyId?.name}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {pref.facultyId?.email}
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1 bg-[#d89860]/15 text-[#493737] rounded-full text-xs font-semibold">
                          {pref.facultyId?.designation || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {pref.courses.length > 0 ? (
                            pref.courses.map((course) => (
                              <span
                                key={course._id}
                                className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                              >
                                <span className="font-bold text-blue-600 mr-1">
                                  {course.code}
                                </span>
                                <span className="hidden sm:inline">
                                  {course.title}
                                </span>
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">
                              No courses
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-[#d89860]" />
                          {new Date(pref.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleDeleteClick(pref)}
                          className="px-3 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <DeletePreferenceModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        selected={selectedPreference}
        refresh={fetchPreferences}
      />
    </ProtectedRoute>
  );
}
