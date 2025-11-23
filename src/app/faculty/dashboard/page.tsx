/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import {
  CalendarDays,
  ClipboardList,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";

type FacultyUser = {
  id: string;
  role: "admin" | "coordinator" | "faculty" | "student";
  name?: string | null;
  email?: string | null;
  image?: string | null;
  designation?: string | null;
};

type FacultySession = {
  user?: FacultyUser;
};

export default function FacultyDashboard() {
  const { data: session } = useSession() as { data: FacultySession | null };
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => setOpen(!open);

  return (
    <ProtectedRoute allowedRoles={["faculty"]}>
      <header className="bg-[#493737] text-white px-6 py-4 flex flex-wrap items-center justify-between shadow-md relative">
        {/* Left Section */}
        <div className="flex items-center gap-3 min-w-[200px] mb-2 sm:mb-0">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
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

        <div className="flex items-center gap-4 relative">
          <button
            onClick={toggleDropdown}
            className="text-white hover:text-gray-300 focus:outline-none"
          >
            <User className="w-6 h-6" />
          </button>

          {open && (
            <div className="absolute right-16 top-12 w-60 bg-white text-black rounded-xl shadow-lg p-4 border border-gray-200 z-50">
              <h3 className="font-semibold text-lg text-[#493737]">
                {session?.user?.name}
              </h3>
              <div className="mt-2 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {session?.user?.email}
                </p>
                <p className="flex items-center gap-2 mt-1 capitalize">
                  <ShieldCheck className="w-4 h-4" /> {session?.user?.role}
                </p>
                {session?.user?.designation && (
                  <p className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4" /> {session.user.designation}
                  </p>
                )}
              </div>
            </div>
          )}

          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl mb-6 border-l-4 border-[#d89860] shadow-sm">
          <h1 className="text-2xl font-semibold text-[#493737]">
            Faculty Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Access your teaching tools and view scheduling information.
          </p>

          {session?.user?.name && (
            <div className="mt-2 text-sm text-gray-500">
              Logged in as{" "}
              <span className="font-medium text-[#493737]">
                {session.user.name}
              </span>{" "}
              ({session.user.email})
              {session.user.designation && (
                <span className="ml-1 text-[#d89860] font-medium">
                  — {session.user.designation}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          <Link href="/faculty/faculty-preferences">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col items-center justify-center text-center border-t-4 border-[#d89860] cursor-pointer">
              <ClipboardList className="text-[#d89860] w-10 h-10 mb-3" />
              <h2 className="font-semibold text-[#493737] text-lg mb-1">
                Course Preferences
              </h2>
              <p className="text-gray-600 text-sm">
                Select at least 5 preferred courses for this semester.
              </p>
            </div>
          </Link>

          <Link href="/faculty/timetable">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col items-center justify-center text-center border-t-4 border-[#d89860] cursor-pointer">
              <CalendarDays className="text-[#d89860] w-10 h-10 mb-3" />
              <h2 className="font-semibold text-[#493737] text-lg mb-1">
                My Timetable
              </h2>
              <p className="text-gray-600 text-sm">
                View your finalized lecture schedule once generated.
              </p>
            </div>
          </Link>
        </div>
      </main>
    </ProtectedRoute>
  );
}
