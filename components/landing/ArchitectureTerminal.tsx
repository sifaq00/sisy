"use client";

import { useState, useEffect } from "react";
import { useInView, Reveal } from "./Reveal";

function TypedTerminal() {
  const [ref, inView] = useInView(0.3);
  const [n, setN] = useState(0);
  const lines = [
    ["$ sisy auth --status", "#8FA07E"],
    ["Connected wallet: 8vB7...8aZ · Solana Web3 auth", "#C7BFAF"],
    ["$ sisy sync --check", "#8FA07E"],
    ["Realtime WebSocket: Connected (mobile & desktop in sync)", "#C7BFAF"],
    ["$ sisy optimize --algo dag", "#8FA07E"],
    ["DAG critical path resolved · 0ms local preview", "#C7BFAF"],
    ["Row Level Security: 100% database-isolated per wallet.", "#C7BFAF"],
  ];

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(lines.length);
      return;
    }

    let isResetting = false;
    const interval = setInterval(() => {
      if (isResetting) return;

      setN((v) => {
        if (v >= lines.length) {
          isResetting = true;
          setTimeout(() => {
            setN(0);
            isResetting = false;
          }, 3200);
          return v;
        }
        return v + 1;
      });
    }, 420);

    return () => clearInterval(interval);
  }, [inView, lines.length]);

  return (
    <div ref={ref} className="s-term border border-[#E2D9C6]/20 shadow-2xl">
      <div className="s-term-bar flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <i style={{ background: "#FF5F56", width: 10, height: 10 }} />
          <i style={{ background: "#FFBD2E", width: 10, height: 10 }} />
          <i style={{ background: "#27C93F", width: 10, height: 10 }} />
        </div>
        <span className="text-[10px] font-mono text-[#8C867A] tracking-wider">
          sisy@realtime-cloud ~ (solana-web3)
        </span>
        <span className="text-[9px] font-mono text-[#8FA07E] font-medium">● 200 OK</span>
      </div>
      <div className="s-term-body">
        {lines.slice(0, n).map(([l, c], i) => (
          <div key={i} className="s-term-line" style={{ color: c }}>
            {l}
          </div>
        ))}
        <span className="s-caret" style={{ color: "#8FA07E" }}>
          ▌
        </span>
      </div>
    </div>
  );
}

export default function ArchitectureTerminal() {
  return (
    <section className="s-proof s-container" id="open">
      <Reveal>
        <div className="s-eyebrow" style={{ textAlign: "center" }}>
          ARCHITECTURE
        </div>
        <h2 className="s-h2" style={{ textAlign: "center" }}>
          Web3 Wallet & Realtime Cloud Engine
        </h2>
      </Reveal>
      <Reveal delay={140}>
        <TypedTerminal />
      </Reveal>
    </section>
  );
}
