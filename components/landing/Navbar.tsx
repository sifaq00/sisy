"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import WalletButton from "@/components/app/WalletButton";
import { useWallet } from "@/context/WalletContext";

interface NavbarProps {
  scrolled?: boolean;
  minimal?: boolean;
}

export default function Navbar({ scrolled, minimal = false }: NavbarProps) {
  const { connected } = useWallet();

  return (
    <nav className={`s-nav ${scrolled ? "s-nav-scrolled" : ""}`}>
      <div className="s-nav-container">
        <div className="s-nav-inner">
          {/* Left Navigation Links or Back Button */}
          {!minimal ? (
            <div className="s-nav-links">
              <a href="#optimizer">Optimizer</a>
              <a href="#tracking">Tracking</a>
              <a href="#open">Architecture</a>
            </div>
          ) : (
            <div className="flex items-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-[#57534A] hover:text-[#211F1A] font-medium bg-[#EFE8D8]/60 hover:bg-[#E9E1CF] px-3 py-1.5 rounded-full border border-[#E2D9C6]/60 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#C9662A]" />
                <span>Back to Home</span>
              </Link>
            </div>
          )}

          {/* Logo */}
          <Link href="/" className="s-logo">
            sisy<span className="s-logo-dot">●</span>
          </Link>

          {/* Right Action */}
          <div className="s-nav-right flex items-center gap-3">
            <WalletButton />
            {!minimal && connected && (
              <Link href="/app">
                <button className="s-pill hidden sm:inline-flex">
                  Workspace <span className="s-pill-arrow">→</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
