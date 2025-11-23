"use client";

import { signOut } from "next-auth/react";

export const logout = async () => {
  try {
    await signOut({
      redirect: true,
      callbackUrl: "/auth/signin",
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
};
