/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      switch (session.user.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "coordinator":
          router.push("/coordinator/dashboard");
          break;
        case "faculty":
          router.push("/faculty/dashboard");
          break;
        case "student":
          router.push("/student/timetable");
          break;
      }
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#d89860] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d89860] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#493737] opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-lg mx-auto">
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          
          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-[#493737] to-[#5a4444] text-white px-8 py-12">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative text-center">
              {/* Logo Container */}
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ring-4 ring-white/20 overflow-hidden">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/VU_Logo.png/960px-VU_Logo.png"
                  alt="VU Logo"
                  className="max-w-[75%] max-h-[75%] object-contain"
                />
              </div>
              
              {/* Welcome Text */}
              <h1 className="text-3xl font-bold mb-3 tracking-tight">Welcome</h1>
              <div className="w-16 h-1 bg-[#d89860] rounded-full mx-auto mb-4"></div>
              <p className="text-white/90 text-base font-medium">
                Automated Lecture Timetable System
              </p>
              <p className="text-white/70 text-sm mt-2">
                Virtual University of Pakistan
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-10">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Final Year Project</h2>
              <p className="text-gray-600 leading-relaxed">
                Access your personalized dashboard to manage schedules, view timetables, and stay organized with our intelligent system.
              </p>
            </div>

            {/* Login Button */}
            <div className="space-y-6">
              <Link
                href="/auth/signin"
                className="group relative block w-full bg-gradient-to-r from-[#d89860] to-[#e0a670] hover:from-[#c88850] hover:to-[#d89860] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out"
              >
                <span className="relative z-10 flex items-center justify-center">
                  <LogIn className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                  Sign In to Continue
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50/50 px-8 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              © 2024 Virtual University of Pakistan. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}