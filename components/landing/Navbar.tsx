"use client";

import Link from "next/link";
import WalletButton from "@/components/app/WalletButton";
import { useWallet } from "@/context/WalletContext";

interface NavbarProps {
  scrolled?: boolean;
}

export default function Navbar({ scrolled }: NavbarProps) {
  const { connected } = useWallet();

  return (
    <nav className={`s-nav ${scrolled ? "s-nav-scrolled" : ""}`}>
      <div className="s-nav-container">
        <div className="s-nav-inner">
          <div className="s-nav-links">
            <a href="#optimizer">Optimizer</a>
            <a href="#tracking">Tracking</a>
            <a href="#open">Architecture</a>
          </div>
          <Link href="/" className="s-logo">
            sisy<span className="s-logo-dot">●</span>
          </Link>
          <div className="s-nav-right flex items-center gap-3">
            <WalletButton />
            {connected && (
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
