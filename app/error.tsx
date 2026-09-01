"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F5F0E4] text-[#211F1A] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#FFFDF7] border border-[#E2D9C6] rounded-3xl p-8 shadow-xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#B83A2E]/10 border border-[#B83A2E]/20 flex items-center justify-center mx-auto mb-4 text-[#B83A2E]">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-xs text-[#57534A] leading-relaxed mb-6 font-mono">
          {error.message || "An unexpected error occurred in the workspace."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="s-pill bg-[#211F1A] text-[#F5F0E4] hover:bg-[#C9662A] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="border border-[#E2D9C6] hover:bg-[#E9E1CF] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 text-[#57534A]"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
