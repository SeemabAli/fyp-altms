"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallbackUrl?: string;
  className?: string;
  label?: string;
}

export default function BackButton({
  fallbackUrl,
  className = "",
  label = "Back",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (fallbackUrl) {
      router.push(fallbackUrl);
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`group flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white px-3.5 py-1.5 rounded-full border border-white/25 text-sm font-medium transition-all duration-200 shadow-sm cursor-pointer ${className}`}
      title="Go back to previous page"
    >
      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      <span>{label}</span>
    </button>
  );
}
