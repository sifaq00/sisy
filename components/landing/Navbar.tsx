"use client";

import Link from "next/link";

interface NavbarProps {
  scrolled: boolean;
}

export default function Navbar({ scrolled }: NavbarProps) {
  return (
    <nav className={`s-nav ${scrolled ? "s-nav-scrolled" : ""}`}>
      <div className="s-nav-container">
        <div className="s-nav-inner">
          <div className="s-nav-links">
            <a href="#optimizer">Optimizer</a>
            <a href="#tracking">Tracking</a>
            <a href="#open">Architecture</a>
          </div>
          <div className="s-logo">
            sisy<span className="s-logo-dot">●</span>
          </div>
          <div className="s-nav-right">
            <Link href="/app">
              <button className="s-pill">
                Open App <span className="s-pill-arrow">→</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
