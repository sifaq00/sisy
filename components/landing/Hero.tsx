"use client";

import { useRef } from "react";
import Link from "next/link";
import { Scene } from "./Scene";
import RingCarousel from "./RingCarousel";

function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const move = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 8;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 6;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = "translate3d(0,0,0)";
  };
  return (
    <span ref={ref} className="s-magnet" onMouseMove={move} onMouseLeave={leave}>
      {children}
    </span>
  );
}

export default function Hero() {
  return (
    <div className="s-heroband">
      {/* Parallax rolling hills scene covering both hero & carousel */}
      <Scene />

      <header className="s-hero s-container">
        <h1 className="s-h1">
          <span className="s-mask">
            <span
              className="s-mask-in s-h1-serif"
              style={{ "--d": "80ms" } as React.CSSProperties}
            >
              The boulder rolls back.
            </span>
          </span>
          <span className="s-mask">
            <span
              className="s-mask-in s-h1-sans"
              style={{ "--d": "220ms" } as React.CSSProperties}
            >
              Push it smarter.
            </span>
          </span>
        </h1>
        <p className="s-sub s-in" style={{ "--d": "420ms" } as React.CSSProperties}>
          sisy is a personal task manager with an automated schedule optimizer.
          <br />
          Your tasks won&apos;t finish themselves — but they can be in the right order.
        </p>
        <div className="s-in" style={{ "--d": "540ms" } as React.CSSProperties}>
          <Magnetic>
            <Link href="/app">
              <button className="s-pill s-pill-lg">
                Launch Dashboard <span className="s-pill-arrow">→</span>
              </button>
            </Link>
          </Magnetic>
        </div>
      </header>

      {/* 3D Ring Carousel floating over the hills */}
      <RingCarousel />
    </div>
  );
}
