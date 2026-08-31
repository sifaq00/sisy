"use client";

import { useRef } from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";
import { SceneNight } from "./Scene";

function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const move = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 8;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };
  return (
    <span ref={ref} className="s-magnet" onMouseMove={move} onMouseLeave={leave}>
      {children}
    </span>
  );
}

export default function NightCTA() {
  return (
    <div className="s-cta-wrapper s-container">
      <Reveal>
        <section className="s-cta">
          <SceneNight />
          <div className="s-cta-inner">
            <h2 className="s-cta-h">
              <span className="s-h1-serif" style={{ color: "#D8D2C2" }}>
                Same boulder tomorrow.
              </span>
              <br />
              <span style={{ color: "#F5F0E4" }}>Better order today.</span>
            </h2>
            <Magnetic>
              <Link href="/app">
                <button className="s-pill s-pill-light">
                  Open Workspace <span className="s-pill-arrow">→</span>
                </button>
              </Link>
            </Magnetic>
            <div className="s-cta-note">Instant cloud sync · zero server setup · high-performance engine</div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
