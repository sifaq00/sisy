"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Disable Lenis smooth scroll on the web app (/app) to allow 100% native touchpad & wheel scrolling
    if (!pathname || pathname.startsWith("/app")) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // High-performance snappy Lenis configuration for landing page
    const lenis = new Lenis({
      lerp: 0.14,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.0,
      smoothWheel: true,
    });

    let animationFrameId: number;

    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
