"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <a
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="text-white text-lg px-3 py-2 rounded bg-red-500 hover:bg-red-600 transition-colors"
    >
      Logout
    </a>
  );
}
