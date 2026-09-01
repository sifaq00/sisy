"use client";

import { motion } from "framer-motion";
import { Wallet, ShieldCheck, Sparkles, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import Navbar from "@/components/landing/Navbar";

export default function WalletGatekeeper() {
  const { setIsModalOpen } = useWallet();

  return (
    <div className="min-h-screen bg-[#F5F0E4] text-[#211F1A] flex flex-col font-sans selection:bg-[#C9662A]/20">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-[#FFFDF7] border border-[#E2D9C6] rounded-3xl p-8 shadow-xl text-center relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#C9662A]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Shield Icon Badge */}
          <div className="w-14 h-14 rounded-2xl bg-[#EFE8D8] border border-[#E2D9C6] flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Lock className="w-6 h-6 text-[#C9662A]" />
          </div>

          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#211F1A] mb-2">
            Private Workspace Locked
          </h2>
          <p className="text-xs text-[#57534A] leading-relaxed mb-6">
            Connect your Solana wallet to unlock your isolated personal task execution engine & DAG optimizer.
          </p>

          {/* Feature Badges */}
          <div className="space-y-2 text-left mb-6 font-mono text-xs text-[#57534A] bg-[#EFE8D8]/50 p-3.5 rounded-2xl border border-[#E2D9C6]/60">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#5A684B] shrink-0" />
              <span>Zero email, zero passwords required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#5A684B] shrink-0" />
              <span>Multi-device realtime cloud sync</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#5A684B] shrink-0" />
              <span>Row Level Security (RLS) database isolation</span>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="w-full group bg-[#211F1A] text-[#F5F0E4] hover:bg-[#C9662A] py-3.5 px-5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-[0_8px_24px_rgba(201,102,42,0.25)] transition-all duration-200 cursor-pointer border border-[#211F1A] hover:border-[#C9662A]"
          >
            <Wallet className="w-4 h-4 text-[#C9662A] group-hover:text-white transition-colors" />
            <span className="group-hover:text-white">Connect Wallet to Access App</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Footer Security Note */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#8C867A]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5A684B]" />
            <span>Non-custodial Solana Web3 authentication</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
