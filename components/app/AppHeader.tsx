"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ListTodo, BarChart3, Clock, Search, Plus, Terminal } from "lucide-react";
import WalletButton from "./WalletButton";

interface AppHeaderProps {
  tab: "tasks" | "gantt" | "time";
  onTabChange: (tab: "tasks" | "gantt" | "time") => void;
  connected: boolean;
  onOpenCmdk: () => void;
  onOpenAddModal: () => void;
  onOpenAudit: () => void;
}

export default function AppHeader({
  tab,
  onTabChange,
  connected,
  onOpenCmdk,
  onOpenAddModal,
  onOpenAudit,
}: AppHeaderProps) {
  return (
    <header className="border-b border-[#E2D9C6] bg-[#F5F0E4]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-[1400px] w-full mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="s-logo flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border border-[#E2D9C6] bg-[#FFFDF7] shadow-xs group-hover:border-[#C9662A]/60 group-hover:shadow-md group-hover:scale-105 transition-all shrink-0">
              <img
                src="/logo.png"
                alt="sisy"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[26px] font-serif font-bold tracking-tight text-[#211F1A]">
              sisy<span className="s-logo-dot text-[#C9662A] text-sm ml-0.5">●</span>
            </span>
          </Link>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#E9E1CF]/70 p-1 rounded-xl border border-[#E2D9C6]/70 relative">
            <button
              onClick={() => onTabChange("tasks")}
              className={`relative px-4 py-1.5 rounded-lg text-xs font-medium transition-colors z-10 flex items-center gap-2 ${
                tab === "tasks" ? "font-bold text-[#211F1A]" : "text-[#57534A] hover:text-[#211F1A]"
              }`}
            >
              {tab === "tasks" && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-[#FFFDF7] rounded-lg shadow-xs border border-[#E2D9C6]/60 -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <ListTodo className="w-3.5 h-3.5" />
              <span>Tasks</span>
            </button>

            <button
              onClick={() => onTabChange("gantt")}
              className={`relative px-4 py-1.5 rounded-lg text-xs font-medium transition-colors z-10 flex items-center gap-2 ${
                tab === "gantt" ? "font-bold text-[#211F1A]" : "text-[#57534A] hover:text-[#211F1A]"
              }`}
            >
              {tab === "gantt" && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-[#FFFDF7] rounded-lg shadow-xs border border-[#E2D9C6]/60 -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Gantt</span>
            </button>

            <button
              onClick={() => onTabChange("time")}
              className={`relative px-4 py-1.5 rounded-lg text-xs font-medium transition-colors z-10 flex items-center gap-2 ${
                tab === "time" ? "font-bold text-[#211F1A]" : "text-[#57534A] hover:text-[#211F1A]"
              }`}
            >
              {tab === "time" && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-[#FFFDF7] rounded-lg shadow-xs border border-[#E2D9C6]/60 -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <Clock className="w-3.5 h-3.5" />
              <span>Time Tracker</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Audit Log Trigger */}
          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-[#FFFDF7] border border-[#E2D9C6] hover:border-[#C9662A] rounded-xl text-[#57534A] transition shadow-2xs group"
            title="Open Audit Log (L)"
          >
            <Terminal className="w-3.5 h-3.5 text-[#8C867A] group-hover:text-[#C9662A]" />
            <span className="hidden sm:inline">Audit Log</span>
          </button>

          {/* Realtime Live Status */}
          <div className="flex items-center gap-2 text-[11px] font-mono px-3 py-1.5 rounded-full bg-[#FFFDF7] border border-[#E2D9C6] text-[#57534A] shadow-2xs">
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-[#5A684B] animate-pulse" : "bg-[#B83A2E]"
              }`}
            />
            <span>{connected ? "Cloud Synced" : "Local Cache"}</span>
          </div>

          {/* Search Trigger */}
          <button
            onClick={onOpenCmdk}
            className="flex items-center gap-3 px-3 py-1.5 text-xs font-mono bg-[#FFFDF7] border border-[#E2D9C6] hover:border-[#C9662A] rounded-xl text-[#8C867A] transition shadow-2xs group"
          >
            <div className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#57534A] group-hover:text-[#C9662A] transition" />
              <span>Search</span>
            </div>
            <kbd className="bg-[#E9E1CF] px-1.5 py-0.5 rounded text-[10px] text-[#57534A] font-semibold">
              ⌘K
            </kbd>
          </button>

          {/* New Task Button */}
          <button
            onClick={onOpenAddModal}
            className="s-pill text-xs py-2 px-4 shadow-sm hover:shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>

          {/* Connected Wallet Button & Account Popover */}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
