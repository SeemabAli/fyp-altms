"use client";

import BackButton from "@/components/BackButton";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border-t-4 border-red-500">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#493737] mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6 text-sm">
          You don&apos;t have permission to view this page. Please sign in with an authorized account.
        </p>
        <div className="flex justify-center gap-3">
          <BackButton
            fallbackUrl="/auth/signin"
            className="!bg-[#493737] !text-white hover:!bg-[#5a4444]"
          />
          <Link
            href="/auth/signin"
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#d89860] hover:bg-[#c08450] text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
