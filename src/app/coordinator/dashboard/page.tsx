/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import BackButton from "@/components/BackButton";
import {
  DoorOpen,
  BookOpen,
  ClipboardList,
  Zap,
  BookX,
  PenTool,
  User,
  UserPlus,
  ShieldCheck,
  Mail,
} from "lucide-react";
import { useState } from "react";

type CoordinatorUser = {
  id: string;
  role: "admin" | "coordinator" | "faculty" | "student";
  name?: string | null;
  email?: string | null;
  image?: string | null;
  designation?: string | null;
};

type CoordinatorSession = {
  user?: CoordinatorUser;
};

export default function CoordinatorDashboard() {
  const { data: session } = useSession() as {
    data: CoordinatorSession | null;
  };
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => setOpen(!open);

  const links = [
    {
      href: "/coordinator/generate-schedule",
      title: "Generate/View Schedule",
      desc: "Automatically generate timetable from preferences.",
      icon: Zap,
    },
    {
      href: "/coordinator/classrooms",
      title: "Manage Classrooms & Labs",
      desc: "Add, edit or view classroom details and multimedia setup.",
      icon: DoorOpen,
    },
    {
      href: "/coordinator/courses",
      title: "Manage Offered Courses",
      desc: "Enter course information and requirements.",
      icon: BookOpen,
    },
    {
      href: "/coordinator/preferences",
      title: "View Faculty Preferences",
      desc: "Check all submitted course preferences by faculty.",
      icon: ClipboardList,
    },
    {
      href: "/coordinator/enrollment",
      title: "Enrollment",
      desc: "View and enroll students.",
      icon: UserPlus,
    },
    {
      href: "/coordinator/unscheduled-summary",
      title: "Unscheduled Summary",
      desc: "Summary that were not assigned to any slot or faculty.",
      icon: BookX,
    },
    {
      href: "/coordinator/manual-scheduling",
      title: "Manual Scheduling",
      desc: "Manually assign remaining courses and faculty to slots.",
      icon: PenTool,
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      <header className="bg-[#493737] text-white px-6 py-4 flex flex-wrap items-center justify-between shadow-md relative">
        <div className="flex items-center gap-3">
          <BackButton fallbackUrl="/auth/signin" />
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/VU_Logo.png/960px-VU_Logo.png"
              alt="VU Logo"
              className="w-7 h-auto"
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
              </div>
            </div>
          )}
          <LogoutButton />
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl mb-6 border-l-4 border-[#d89860] shadow-sm">
          <h1 className="text-2xl font-semibold text-[#493737]">
            Coordinator Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Manage classrooms, courses, preferences, and schedule generation.
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
        <div className="space-y-6">
          <div className="grid grid-cols-1">
            {(() => {
              const item = links[0];
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className="
              bg-white rounded-xl shadow-md hover:shadow-lg 
              hover:-translate-y-1 transition-all duration-300 
              p-6 flex flex-col items-center justify-between 
              text-center border-t-4 border-[#d89860] cursor-pointer h-full
            "
                  >
                    <div className="flex flex-col items-center">
                      <Icon className="text-[#d89860] w-10 h-10 mb-3" />
                      <h2 className="font-semibold text-[#493737] text-lg mb-1">
                        {item.title}
                      </h2>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </Link>
              );
            })()}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[1fr]">
            {links.slice(1).map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className="
              bg-white rounded-xl shadow-md hover:shadow-lg 
              hover:-translate-y-1 transition-all duration-300 
              p-6 flex flex-col items-center justify-between 
              text-center border-t-4 border-[#d89860] cursor-pointer h-full
            "
                  >
                    <div className="flex flex-col items-center">
                      <Icon className="text-[#d89860] w-10 h-10 mb-3" />
                      <h2 className="font-semibold text-[#493737] text-lg mb-1">
                        {item.title}
                      </h2>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
