"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";
import { Smartphone, Laptop, Zap, ShieldCheck } from "lucide-react";

function RealtimeDeviceDemo() {
  const [synced, setSynced] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setSynced((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="s-mini s-mini-dark space-y-4" style={{ padding: "22px 24px", borderRadius: 20 }}>
      <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono text-[11px] text-[#A8C27E]">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#C9662A]" />
          <span>Realtime Cloud Broadcast</span>
        </div>
        <span className="text-[#A8C27E]">● Live (0ms)</span>
      </div>

      <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
        {/* Mobile Device View */}
        <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase">
            <Smartphone className="w-3 h-3 text-[#C9662A]" /> Mobile Phone
          </div>
          <div className="text-white font-medium text-xs truncate">
            {synced ? "✓ Refactor DAG Engine" : "○ Review PR & Merge"}
          </div>
          <span className="inline-block text-[9px] bg-[#C9662A]/20 text-[#C9662A] px-1.5 py-0.5 rounded">
            {synced ? "Status: DONE" : "Status: IN PROGRESS"}
          </span>
        </div>

        {/* Laptop Device View */}
        <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase">
            <Laptop className="w-3 h-3 text-[#5A684B]" /> Desktop Screen
          </div>
          <div className="text-white font-medium text-xs truncate">
            {synced ? "✓ Refactor DAG Engine" : "○ Review PR & Merge"}
          </div>
          <span className="inline-block text-[9px] bg-[#5A684B]/20 text-[#5A684B] px-1.5 py-0.5 rounded">
            {synced ? "Schedule Reordered" : "Schedule Reordered"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-[#5A684B]" />
        <span>Row Level Security (RLS) encrypted per wallet</span>
      </div>
    </div>
  );
}

export default function FeatureHeritage() {
  return (
    <div className="s-feat">
      <Reveal from="left">
        <div className="s-feat-text">
          <div className="s-eyebrow">SEAMLESS SYNC</div>
          <h2 className="s-h2">
            Edit on your phone,
            <br />
            instantly live on laptop
          </h2>
          <p>
            Powered by Supabase Realtime and Solana Web3 wallet isolation. Create, update, or complete a task on the go, and your desktop schedule recalculates in zero milliseconds without page reload.
          </p>
          <Link href="/app" className="s-textlink group inline-flex items-center gap-1.5">
            <span>Open your workspace</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </Reveal>
      <Reveal from="right" delay={120}>
        <div className="s-feat-media s-feat-media-dark" style={{ padding: 24, borderRadius: 24 }}>
          <RealtimeDeviceDemo />
        </div>
      </Reveal>
    </div>
  );
}
