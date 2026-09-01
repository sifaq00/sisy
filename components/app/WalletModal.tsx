"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Loader2, Sparkles, Wallet, Check } from "lucide-react";
import { SUPPORTED_WALLETS, WalletOption, useWallet } from "@/context/WalletContext";

function getPhantomProvider() {
  if (typeof window === "undefined") return null;
  if ("phantom" in window && (window as any).phantom?.solana?.isPhantom) {
    return (window as any).phantom.solana;
  }
  if ("solana" in window && (window as any).solana?.isPhantom) {
    return (window as any).solana;
  }
  return null;
}

function timeoutPromise<T>(promise: Promise<T>, ms: number, errMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errMsg)), ms)),
  ]);
}

export default function WalletModal() {
  const { isModalOpen, setIsModalOpen, connectWallet } = useWallet();
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      setErrorMessage(null);
      setConnectingId(null);
    }
  }, [isModalOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    if (isModalOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, setIsModalOpen]);

  const handleSelectWallet = async (wallet: WalletOption) => {
    setConnectingId(wallet.id);
    setErrorMessage(null);

    const isInstalled = wallet.detect();

    // If wallet extension is not installed, open download page & provide quick demo address
    if (!isInstalled) {
      const fallbackAddrs: Record<string, string> = {
        phantom: "8vB7sP2mK9vL3xQ7eR5tY1wN4uI6oP8aZ",
        solflare: "SolF1are7xKp9M2vL3xQ7eR5tY1wN4uI6oP8aZ",
        backpack: "Back9Pack7xKp9M2vL3xQ7eR5tY1wN4uI6oP8aZ",
        metamask: "0x71C8eA9F4aB26B1E5F482939281726a8492019",
        okx: "OKX7xKp9M2vL3xQ7eR5tY1wN4uI6oP8aZ",
        coinbase: "0x482939281726a849201971C8eA9F4aB26B1E5F",
        nightly: "Nigh7ly7xKp9M2vL3xQ7eR5tY1wN4uI6oP8aZ",
        trust: "0x39281726a849201971C8eA9F4aB26B1E5F4829",
        bitkeep: "Bit8get7xKp9M2vL3xQ7eR5tY1wN4uI6oP8aZ",
        ledger: "Ledg9er7xKp9M2vL3xQ7eR5tY1wN4uI6oP8aZ",
      };

      try {
        window.open(wallet.installUrl, "_blank", "noopener,noreferrer");
      } catch {}

      connectWallet(wallet, fallbackAddrs[wallet.id] || "8vB7sP2mK9vL3xQ7eR5tY1wN4uI6oP8aZ");
      setConnectingId(null);
      setIsModalOpen(false);
      return;
    }

    try {
      // 1. Phantom Native Connection
      if (wallet.id === "phantom") {
        const phantom = getPhantomProvider();
        if (phantom) {
          const res: any = await timeoutPromise(
            phantom.connect(),
            12000,
            "Phantom connection timed out. Please unlock your wallet."
          );
          if (res?.publicKey) {
            connectWallet(wallet, res.publicKey.toString());
            setConnectingId(null);
            setIsModalOpen(false);
            return;
          }
        }
      }

      // 2. Solflare Native Connection
      if (wallet.id === "solflare" && (window as any).solflare) {
        await timeoutPromise(
          (window as any).solflare.connect(),
          12000,
          "Solflare connection timed out."
        );
        if ((window as any).solflare.publicKey) {
          connectWallet(wallet, (window as any).solflare.publicKey.toString());
          setConnectingId(null);
          setIsModalOpen(false);
          return;
        }
      }

      // 3. Backpack Native Connection
      if (wallet.id === "backpack" && (window as any).backpack) {
        const res: any = await timeoutPromise(
          (window as any).backpack.connect(),
          12000,
          "Backpack connection timed out."
        );
        if (res?.publicKey) {
          connectWallet(wallet, res.publicKey.toString());
          setConnectingId(null);
          setIsModalOpen(false);
          return;
        }
      }

      // 4. OKX Native Connection
      if (wallet.id === "okx" && (window as any).okxwallet?.solana) {
        const res: any = await timeoutPromise(
          (window as any).okxwallet.solana.connect(),
          12000,
          "OKX Wallet connection timed out."
        );
        if (res?.publicKey) {
          connectWallet(wallet, res.publicKey.toString());
          setConnectingId(null);
          setIsModalOpen(false);
          return;
        }
      }

      // 5. MetaMask EVM Connection
      if (wallet.id === "metamask" && (window as any).ethereum) {
        const accounts = (await timeoutPromise(
          (window as any).ethereum.request({ method: "eth_requestAccounts" }),
          12000,
          "MetaMask connection timed out."
        )) as string[];
        if (Array.isArray(accounts) && accounts.length > 0) {
          connectWallet(wallet, accounts[0]);
          setConnectingId(null);
          setIsModalOpen(false);
          return;
        }
      }
    } catch (err: any) {
      if (err?.code === 4001 || err?.message?.includes("User rejected")) {
        setErrorMessage("Connection request was cancelled by user.");
      } else {
        setErrorMessage(err?.message || "Connection timed out. Please try again.");
      }
      setConnectingId(null);
      return;
    }

    setConnectingId(null);
  };

  if (!isModalOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsModalOpen(false)}
        className="fixed inset-0 bg-[#211F1A]/70 backdrop-blur-xs"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="relative my-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-[#E2D9C6] bg-[#FFFDF7] p-5 text-[#211F1A] shadow-2xl z-10 font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2D9C6] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C9662A]/10 border border-[#C9662A]/20 flex items-center justify-center text-[#C9662A]">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#211F1A]">Connect Wallet</h3>
              <p className="text-[11px] text-[#8C867A]">Select your Solana or Web3 wallet to enter</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            aria-label="Close modal"
            className="rounded-full p-1.5 text-[#8C867A] hover:bg-[#E9E1CF] hover:text-[#211F1A] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-xl border border-[#B83A2E]/20 bg-[#B83A2E]/10 p-2.5 text-xs text-[#B83A2E]"
          >
            <span className="font-bold">Notice:</span> {errorMessage}
          </motion.div>
        )}

        {/* Wallets List */}
        <div className="mt-3 space-y-1.5 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
          {SUPPORTED_WALLETS.map((wallet) => {
            const isInstalled = wallet.detect();
            const isConnecting = connectingId === wallet.id;

            return (
              <button
                key={wallet.id}
                onClick={() => handleSelectWallet(wallet)}
                disabled={isConnecting}
                className="group flex w-full items-center justify-between rounded-xl border border-[#E2D9C6]/80 bg-[#EFE8D8]/40 hover:bg-[#E9E1CF] hover:border-[#C9662A]/50 p-2.5 px-3 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-white border border-[#E2D9C6] p-1.5 group-hover:border-[#C9662A] transition-colors">
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      onError={(e) => {
                        e.currentTarget.src = "/wallets/phantom.svg";
                      }}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#211F1A] group-hover:text-[#C9662A] transition-colors">
                        {wallet.name}
                      </span>
                      <span className="rounded-md bg-[#E9E1CF] px-1.5 py-0.2 font-mono text-[8.5px] text-[#8C867A]">
                        {wallet.chain}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8C867A]">
                      {isInstalled ? "Detected & Ready" : "Click to connect"}
                    </p>
                  </div>
                </div>

                <div>
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#C9662A]" />
                  ) : isInstalled ? (
                    <span className="flex items-center gap-1 font-mono text-[9px] font-semibold text-[#5A684B] bg-[#5A684B]/15 border border-[#5A684B]/30 px-2 py-0.5 rounded-full">
                      <Check className="h-2.5 w-2.5" />
                      <span>Installed</span>
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-[#8C867A] group-hover:text-[#C9662A]">
                      Connect →
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Demo Connect */}
        <div className="mt-3 pt-2.5 border-t border-[#E2D9C6] flex items-center justify-between text-xs font-mono">
          <span className="text-[10px] text-[#8C867A]">Quick demo testing?</span>
          <button
            onClick={() => {
              connectWallet(SUPPORTED_WALLETS[0], "8vB7sP2mK9vL3xQ7eR5tY1wN4uI6oP8aZ");
              setIsModalOpen(false);
            }}
            className="text-[10px] font-bold text-[#C9662A] hover:underline"
          >
            Enter Demo Wallet →
          </button>
        </div>

        {/* Security Footer */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-[#8C867A] pt-2 border-t border-[#E2D9C6]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#5A684B]" />
          <span>Non-custodial & secure. Powered by Solana Web3.</span>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
