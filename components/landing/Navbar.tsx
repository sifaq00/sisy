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
              <a href="#demo">Demo</a>
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
          <Link href="/" className="s-logo flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl overflow-hidden border border-[#E2D9C6] bg-[#FFFDF7] shadow-xs group-hover:border-[#C9662A]/60 group-hover:shadow-md group-hover:scale-105 transition-all shrink-0">
              <img
                src="/logo.png"
                alt="sisy"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-2xl md:text-[28px] font-serif font-bold tracking-tight text-[#211F1A]">
              sisy<span className="s-logo-dot text-[#C9662A] text-sm ml-0.5">●</span>
            </span>
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
