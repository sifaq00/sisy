"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";

function LoopingHeritageTerminal() {
  const [step, setStep] = useState(0);

  const scripts = [
    {
      cmd: "$ sisy add 'ship v1.0' --priority 5",
      res: "✓ SY-0005 created · status TODO",
      nextCmd: "$ sisy optimize --algo greedy",
      nextRes: "✓ 8 tasks reordered in 0.09s",
    },
    {
      cmd: "$ sisy time --start SY-0001",
      res: "✓ timer active on SY-0001 (00:00:01)",
      nextCmd: "$ sisy status --realtime",
      nextRes: "✓ 3 active · 1 done · cloud synced",
    },
    {
      cmd: "$ sisy tui",
      res: "✓ launching interactive TUI console…",
      nextCmd: "$ sisy sync --ws",
      nextRes: "✓ postgres realtime connected (12ms)",
    },
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setStep((prev) => (prev + 1) % scripts.length);
    }, 3800);
    return () => clearInterval(id);
  }, [scripts.length]);

  const current = scripts[step];

  return (
    <div className="s-mini s-mini-dark" style={{ fontSize: 11.5, lineHeight: 2.1, padding: "18px 20px", borderRadius: 16 }}>
      <div style={{ color: "#8FA07E" }}>{current.cmd}</div>
      <div style={{ color: "#C7BFAF" }}>{current.res}</div>
      <div style={{ color: "#8FA07E", marginTop: 6 }}>{current.nextCmd}</div>
      <div style={{ color: "#C7BFAF" }}>
        {current.nextRes}
        <span className="s-caret">▌</span>
      </div>
    </div>
  );
}

export default function FeatureHeritage() {
  return (
    <div className="s-feat">
      <Reveal from="left">
        <div className="s-feat-text">
          <div className="s-eyebrow">THE HERITAGE</div>
          <h2 className="s-h2">
            Terminal-born,
            <br />
            web-grown
          </h2>
          <p>
            Full CLI and REST API capability alongside the modern web app. Same server, same cloud sync, live over WebSocket — close the browser mid-task and keep working smoothly. Zero sync lag.
          </p>
          <Link href="/app" className="s-textlink group inline-flex items-center gap-1.5">
            <span>Explore workspace features</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </Reveal>
      <Reveal from="right" delay={120}>
        <div className="s-feat-media s-feat-media-dark" style={{ padding: 24, borderRadius: 24 }}>
          <LoopingHeritageTerminal />
        </div>
      </Reveal>
    </div>
  );
}
