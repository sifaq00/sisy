"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Copy, ExternalLink, LogOut, ChevronDown, RefreshCw } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

export default function WalletButton() {
  const {
    connected,
    address,
    walletName,
    walletIcon,
    balance,
    symbol,
    shortAddress,
    setIsModalOpen,
    disconnectWallet,
    fetchBalance,
  } = useWallet();

  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const isEvm = address.startsWith("0x");
  const explorerUrl = isEvm
    ? `https://etherscan.io/address/${address}`
    : `https://solscan.io/account/${address}`;

  return (
    <div className="relative shrink-0 font-sans" ref={dropdownRef}>
      {!connected ? (
        <button
          onClick={() => setIsModalOpen(true)}
          className="s-pill bg-[#211F1A] text-[#F5F0E4] hover:bg-[#C9662A] px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Wallet className="w-3.5 h-3.5 text-[#C9662A]" />
          <span>Connect Wallet</span>
        </button>
      ) : (
        <button
          onClick={() => {
            setMenuOpen((prev) => !prev);
            if (!menuOpen) fetchBalance(address);
          }}
          className="flex items-center gap-2 bg-[#FFFDF7] border border-[#E2D9C6] hover:border-[#C9662A] py-1.5 px-3 rounded-xl text-xs font-medium text-[#211F1A] shadow-xs transition"
        >
          <img
            src={walletIcon}
            alt={walletName}
            onError={(e) => {
              e.currentTarget.src = "/wallets/phantom.svg";
            }}
            className="w-4 h-4 object-contain"
          />

          <span className="font-mono text-xs font-bold text-[#211F1A]">{shortAddress}</span>

          <ChevronDown
            className={`w-3 h-3 text-[#8C867A] transition-transform ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {/* Account Popover */}
      <AnimatePresence>
        {menuOpen && connected && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E2D9C6] bg-[#FFFDF7] p-4 text-[#211F1A] shadow-2xl z-50 font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E2D9C6] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EFE8D8] border border-[#E2D9C6] p-1.5 flex items-center justify-center">
                  <img
                    src={walletIcon}
                    alt={walletName}
                    onError={(e) => {
                      e.currentTarget.src = "/wallets/phantom.svg";
                    }}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#211F1A] flex items-center gap-1.5">
                    <span>{walletName}</span>
                    <span className="text-[9px] font-mono bg-[#E9E1CF] px-1.5 py-0.5 rounded text-[#8C867A]">
                      {symbol}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-[#C9662A] font-semibold">
                    {shortAddress}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Balance */}
            <div className="my-3 rounded-xl bg-[#EFE8D8]/50 p-2.5 border border-[#E2D9C6]/60">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8C867A] uppercase">
                <span>Wallet Balance</span>
                <button
                  onClick={async () => {
                    setIsRefreshing(true);
                    await fetchBalance(address);
                    setIsRefreshing(false);
                  }}
                  disabled={isRefreshing}
                  title="Refresh Balance"
                  className="hover:text-[#211F1A]"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-[#C9662A]" : ""}`} />
                </button>
              </div>
              <div className="mt-1 font-mono text-sm font-bold text-[#211F1A]">
                {balance} {symbol}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-1 text-xs">
              <button
                onClick={handleCopy}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-[#E9E1CF] text-[#57534A] hover:text-[#211F1A] transition"
              >
                <span className="flex items-center gap-2">
                  <Copy className="w-3.5 h-3.5 text-[#C9662A]" />
                  <span>Copy Address</span>
                </span>
                {copied && <span className="text-[10px] text-[#5A684B] font-mono font-bold">Copied!</span>}
              </button>

              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-[#E9E1CF] text-[#57534A] hover:text-[#211F1A] transition"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-[#C9662A]" />
                  <span>View on Explorer</span>
                </span>
              </a>

              <button
                onClick={() => {
                  disconnectWallet();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[#B83A2E] hover:bg-[#B83A2E]/10 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
