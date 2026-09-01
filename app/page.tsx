"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import FeatureOptimizer from "@/components/landing/FeatureOptimizer";
import FeatureTracking from "@/components/landing/FeatureTracking";
import FeatureHeritage from "@/components/landing/FeatureHeritage";
import Footer from "@/components/landing/Footer";

// Dynamically load below-the-fold components for ultra-light initial paint
const LiveAppDemo = dynamic(() => import("@/components/landing/LiveAppDemo"), {
  ssr: true,
  loading: () => <div className="min-h-[400px]" />,
});

const ArchitectureTerminal = dynamic(() => import("@/components/landing/ArchitectureTerminal"), {
  ssr: true,
  loading: () => <div className="min-h-[300px]" />,
});

const NightCTA = dynamic(() => import("@/components/landing/NightCTA"), {
  ssr: true,
  loading: () => <div className="min-h-[250px]" />,
});

export default function SisyLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let ticking = false;
    const boulderEl = document.getElementById("s-boulder-indicator");

    const updateScroll = () => {
      const scrollY = window.scrollY;
      const isScrolled = scrollY > 8;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));

      if (boulderEl) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const prog = max > 0 ? scrollY / max : 0;
        boulderEl.style.left = `calc(${(prog * 100).toFixed(2)}% - 5px)`;
        boulderEl.style.transform = `rotate(${(prog * 720).toFixed(0)}deg)`;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = setTimeout(() => setLoaded(true), 30);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`s-root ${loaded ? "s-loaded" : ""}`}>
      {/* Boulder Scroll Progress */}
      <div className="s-progress" aria-hidden="true">
        <div className="s-progress-line" />
        <div id="s-boulder-indicator" className="s-boulder" />
      </div>

      {/* Sticky Header Navbar */}
      <Navbar scrolled={scrolled} />

      {/* Hero Section with Parallax Scene & 3D Ring Carousel over the Hills */}
      <Hero />

      {/* Infinite Marquee Ticker */}
      <Marquee />

      {/* Feature Sections: Optimizer, Tracking, and Heritage */}
      <section className="s-feat-wrap s-container" id="optimizer">
        <FeatureOptimizer />
        <FeatureTracking />
        <FeatureHeritage />
      </section>

      {/* Live Interactive App Demo Sandbox */}
      <LiveAppDemo />

      {/* Architecture Typed Terminal */}
      <ArchitectureTerminal />

      {/* Night Sky CTA */}
      <NightCTA />

      {/* Clean Footer */}
      <Footer />
    </div>
  );
}
