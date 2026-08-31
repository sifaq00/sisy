"use client";

import { useRef, useState, useEffect } from "react";
import {
  MiniSchedule,
  MiniTasks,
  MiniTimer,
  MiniCLI,
  MiniGantt,
  MiniDeps,
  MiniNotes,
  MiniWs,
  MiniAudit,
  MiniHeat,
  MiniBench,
  MiniPri,
} from "./MiniCards";

export default function RingCarousel() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Intel Celeron / Low-end GPU optimization:
  // Pause 3D GPU transforms completely when scrolled out of viewport!
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: "100px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const ringCards = [
    <MiniSchedule key="s" />,
    <MiniTasks key="t" />,
    <MiniTimer key="ti" />,
    <MiniCLI key="c" />,
    <MiniGantt key="g" />,
    <MiniDeps key="d" />,
    <MiniNotes key="n" />,
    <MiniWs key="w" />,
    <MiniAudit key="a" />,
    <MiniHeat key="h" />,
    <MiniBench key="b" />,
    <MiniPri key="p" />,
  ];

  return (
    <div
      ref={stageRef}
      className="s-stage s-in"
      style={{ "--d": "700ms" } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="s-ring-tilt">
        <div
          className="s-ring"
          style={{ animationPlayState: isVisible ? "running" : "paused" }}
        >
          {ringCards.map((c, i) => (
            <div key={i} className="s-ring-card" style={{ "--i": i } as React.CSSProperties}>
              {c}
            </div>
          ))}
        </div>
      </div>
      <div className="s-stage-fade s-stage-fade-l" />
      <div className="s-stage-fade s-stage-fade-r" />
    </div>
  );
}
