/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import {
  DoorOpen,
  BookOpen,
  ClipboardList,
  Zap,
  Eye,
  BookX,
  CalendarX,
  PenTool,
  User,
  UserPlus,
} from "lucide-react";

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

  const links = [
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
      href: "/coordinator/generate-schedule",
      title: "Generate Schedule",
      desc: "Automatically generate timetable from preferences.",
      icon: Zap,
    },
    {
      href: "/coordinator/view-schedule",
      title: "View Full Schedule",
      desc: "See all scheduled lectures by faculty, course, or room.",
      icon: Eye,
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
      href: "/coordinator/timeslot",
      title: "Manage Timeslots",
      desc: "View rooms and slots still available after scheduling.",
      icon: CalendarX,
    },
    {
      href: "/coordinator/manual-scheduling",
      title: "Manual Scheduling",
      desc: "Manually assign remaining courses and faculty to slots.",
      icon: PenTool,
    },
    {
      href: "/coordinator/profile",
      title: "My Profile",
      desc: "View and update your profile information.",
      icon: User,
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      {/* HEADER */}
      <header className="bg-[#493737] text-white px-6 py-4 flex flex-wrap items-center justify-between shadow-md">
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
        <LogoutButton />
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Dashboard Header */}
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

        {/* GRID CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className="bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col items-center justify-center text-center border-t-4 border-[#d89860] cursor-pointer">
                  <Icon className="text-[#d89860] w-10 h-10 mb-3" />
                  <h2 className="font-semibold text-[#493737] text-lg mb-1">
                    {item.title}
                  </h2>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </ProtectedRoute>
  );
}
