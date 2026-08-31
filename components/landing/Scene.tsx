"use client";

import { useEffect, useRef } from "react";

export function Scene() {
  const hill1Ref = useRef<SVGSVGElement>(null);
  const hill2Ref = useRef<SVGSVGElement>(null);
  const hill3Ref = useRef<SVGSVGElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const handleScroll = () => {
      const y = window.scrollY;
      if (y > 650) return; // Stop calculating once hero is out of view!

      if (!ticking) {
        requestAnimationFrame(() => {
          if (hill1Ref.current) hill1Ref.current.style.transform = `translate3d(0, ${Math.min(y * 0.05, 50)}px, 0)`;
          if (hill2Ref.current) hill2Ref.current.style.transform = `translate3d(0, ${Math.min(y * 0.09, 50)}px, 0)`;
          if (hill3Ref.current) hill3Ref.current.style.transform = `translate3d(0, ${Math.min(y * 0.14, 50)}px, 0)`;
          if (sunRef.current) sunRef.current.style.transform = `translate3d(0, ${Math.min(y * 0.03, 50)}px, 0)`;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="s-scene" aria-hidden="true">
      <div ref={sunRef} className="s-sun" />
      <div className="s-cloud s-cloud-a" />
      <div className="s-cloud s-cloud-b" />
      <svg ref={hill1Ref} className="s-hill s-hill-1" viewBox="0 0 1440 420" preserveAspectRatio="none">
        <path d="M0,300 C240,255 480,285 720,250 C960,215 1200,265 1440,225 L1440,420 L0,420 Z" fill="#ECE4CD" />
      </svg>
      <svg ref={hill2Ref} className="s-hill s-hill-2" viewBox="0 0 1440 420" preserveAspectRatio="none">
        <path d="M0,340 C210,298 500,332 760,300 C1020,268 1250,315 1440,288 L1440,420 L0,420 Z" fill="#E2D6B8" />
      </svg>
      <svg ref={hill3Ref} className="s-hill s-hill-3" viewBox="0 0 1440 420" preserveAspectRatio="none">
        <path d="M0,382 C260,342 520,372 800,346 C1080,320 1290,358 1440,338 L1440,420 L0,420 Z" fill="#D5C9A6" />
        <path d="M120,378 C260,352 420,362 560,349" stroke="#B8AC89" strokeWidth="1.5" strokeDasharray="1 7" fill="none" strokeLinecap="round" />
        <circle cx="378" cy="352" r="7" fill="#C9662A" />
        <circle cx="376" cy="350" r="1.8" fill="#F5F0E4" opacity="0.75" />
      </svg>
      <div className="s-scene-fade" />
    </div>
  );
}

export function SceneNight() {
  return (
    <div className="s-night" aria-hidden="true">
      <div className="s-moon" />
      <span className="s-star" style={{ left: "16%", top: "22%" }} />
      <span className="s-star" style={{ left: "30%", top: "12%", animationDelay: "1.2s" }} />
      <span className="s-star" style={{ left: "70%", top: "16%", animationDelay: "0.6s" }} />
      <span className="s-star" style={{ left: "84%", top: "30%", animationDelay: "1.8s" }} />
      <svg className="s-night-hill" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d="M0,140 C260,105 560,135 820,110 C1080,85 1280,120 1440,100 L1440,200 L0,200 Z" fill="#1B1A14" />
        <path d="M0,175 C300,150 640,172 940,152 C1180,138 1340,160 1440,150 L1440,200 L0,200 Z" fill="#141310" />
        <circle cx="1050" cy="106" r="5" fill="#C9662A" opacity="0.85" />
      </svg>
    </div>
  );
}
