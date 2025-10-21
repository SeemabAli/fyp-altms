"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="flex items-center gap-2 bg-[#d89860] text-white px-4 py-2 rounded-full 
                 shadow-md hover:bg-[#c08450] active:scale-95 transition-all duration-200"
    >
      <LogOut className="w-5 h-5" />
      <span className="font-medium">Logout</span>
    </button>
  );
}
