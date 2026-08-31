"use client";

import { useRef, useState, useEffect } from "react";

export default function Marquee() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: "50px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const marquee = [
    "9 scheduling algorithms",
    "planned vs actual",
    "no team chat",
    "MIT licensed",
    "realtime cloud sync",
    "Zero server setup",
    "Task table · Gantt · Time",
    "dependencies that hold",
  ];

  return (
    <div ref={marqueeRef} className="s-marquee" aria-hidden="true">
      <div
        className="s-marquee-track"
        style={{ animationPlayState: isVisible ? "running" : "paused" }}
      >
        {[0, 1].map((dup) => (
          <div key={dup} className="s-marquee-group">
            {marquee.map((m) => (
              <span key={m + dup} className="s-marquee-item">
                {m}
                <i>●</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
