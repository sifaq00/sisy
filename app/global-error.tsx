"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F0E4] text-[#211F1A] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#FFFDF7] border border-[#E2D9C6] rounded-3xl p-8 shadow-xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#B83A2E]/10 border border-[#B83A2E]/20 flex items-center justify-center mx-auto mb-4 text-[#B83A2E]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-2">Global System Error</h2>
          <p className="text-xs text-[#57534A] leading-relaxed mb-6 font-mono">
            {error.message || "An unexpected critical error occurred."}
          </p>
          <button
            onClick={() => reset()}
            className="s-pill bg-[#211F1A] text-[#F5F0E4] hover:bg-[#C9662A] px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
