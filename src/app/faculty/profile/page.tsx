/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";

interface FacultyProfile {
  name: string;
  email: string;
  role: string;
  designation?: string;
}

export default function FacultyProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/faculty/profile");
        const data = await res.json();
        setProfile(data.user || null);
      } catch {
        console.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["faculty"]}>
      <div
        className="bg-[
#493737] text-white px-6 py-4 flex flex-wrap items-center justify-between shadow-md"
      >
        <div className="flex items-center gap-3 min-w-[200px] mb-2 sm:mb-0">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/VU_Logo.png/960px-VU_Logo.png"
              alt="VU Logo"
              className="w-8 h-auto"
            />
          </div>
          <span className="text-lg font-semibold">
            Automated Timetable System
          </span>
        </div>
        <button className="px-4 py-2 rounded text-sm">
          <LogoutButton />
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* PAGE TITLE */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#d89860] to-[#c47d47]"></div>
            <div className="pl-4">
              <h1 className="text-3xl font-bold text-[#493737] mb-2">
                My Profile
              </h1>
              <p className="text-gray-600">
                View your account details and designation information.
              </p>
            </div>
          </div>

          {/* PROFILE CARD */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-12 h-12 border-4 border-[#d89860] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500">Loading profile...</p>
              </div>
            ) : !profile ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">Unable to load profile.</p>
              </div>
            ) : (
              <div className="p-8">
                {/* Profile Header */}
                <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-200">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#d89860] to-[#c47d47] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#493737]">
                      {profile.name}
                    </h2>
                    <p className="text-[#d89860] font-medium capitalize mt-1">
                      {profile.role}
                    </p>
                  </div>
                </div>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#d89860] group-hover:text-white transition-colors duration-200">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Full Name
                      </p>
                    </div>
                    <p className="text-lg text-[#493737] font-semibold ml-13">
                      {profile.name}
                    </p>
                  </div>

                  <div className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#d89860] group-hover:text-white transition-colors duration-200">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Email Address
                      </p>
                    </div>
                    <p className="text-lg text-[#493737] font-semibold ml-13 break-all">
                      {profile.email}
                    </p>
                  </div>

                  <div className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#d89860] group-hover:text-white transition-colors duration-200">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </p>
                    </div>
                    <p className="text-lg text-[#493737] font-semibold capitalize ml-13">
                      {profile.role}
                    </p>
                  </div>

                  {profile.designation && (
                    <div className="group">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#d89860] group-hover:text-white transition-colors duration-200">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Designation
                        </p>
                      </div>
                      <p className="text-lg text-[#493737] font-semibold ml-13">
                        {profile.designation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
