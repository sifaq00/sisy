"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

declare global {
  interface Window {
    solana?: any;
    phantom?: any;
    solflare?: any;
    backpack?: any;
    okxwallet?: any;
    ethereum?: any;
    coinbaseWalletExtension?: any;
    nightly?: any;
    trustwallet?: any;
    bitkeep?: any;
  }
}

export type WalletType =
  | "phantom"
  | "solflare"
  | "backpack"
  | "okx"
  | "metamask"
  | "coinbase"
  | "nightly"
  | "bitkeep"
  | "trust"
  | "ledger";

export interface WalletOption {
  id: WalletType;
  name: string;
  chain: "Solana" | "Multi-Chain" | "Ethereum";
  icon: string;
  installUrl: string;
  detect: () => boolean;
}

export const SUPPORTED_WALLETS: WalletOption[] = [
  {
    id: "phantom",
    name: "Phantom",
    chain: "Solana",
    icon: "/wallets/phantom.svg",
    installUrl: "https://phantom.app/",
    detect: () =>
      Boolean(
        typeof window !== "undefined" &&
          (window.solana?.isPhantom || window.phantom?.solana?.isPhantom)
      ),
  },
  {
    id: "solflare",
    name: "Solflare",
    chain: "Solana",
    icon: "/wallets/solflare.svg",
    installUrl: "https://solflare.com/",
    detect: () => Boolean(typeof window !== "undefined" && window.solflare?.isSolflare),
  },
  {
    id: "backpack",
    name: "Backpack",
    chain: "Solana",
    icon: "/wallets/backpack.svg",
    installUrl: "https://backpack.app/",
    detect: () => Boolean(typeof window !== "undefined" && window.backpack),
  },
  {
    id: "okx",
    name: "OKX Wallet",
    chain: "Multi-Chain",
    icon: "/wallets/okx.svg",
    installUrl: "https://www.okx.com/web3",
    detect: () => Boolean(typeof window !== "undefined" && window.okxwallet),
  },
  {
    id: "metamask",
    name: "MetaMask",
    chain: "Multi-Chain",
    icon: "/wallets/metamask.svg",
    installUrl: "https://metamask.io/",
    detect: () => Boolean(typeof window !== "undefined" && window.ethereum?.isMetaMask),
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    chain: "Multi-Chain",
    icon: "/wallets/coinbase.svg",
    installUrl: "https://www.coinbase.com/wallet",
    detect: () => Boolean(typeof window !== "undefined" && window.coinbaseWalletExtension),
  },
  {
    id: "nightly",
    name: "Nightly",
    chain: "Solana",
    icon: "/wallets/nightly.svg",
    installUrl: "https://nightly.app/",
    detect: () => Boolean(typeof window !== "undefined" && window.nightly),
  },
  {
    id: "trust",
    name: "Trust Wallet",
    chain: "Multi-Chain",
    icon: "/wallets/trust.svg",
    installUrl: "https://trustwallet.com/",
    detect: () => Boolean(typeof window !== "undefined" && window.trustwallet),
  },
  {
    id: "bitkeep",
    name: "Bitget Wallet",
    chain: "Multi-Chain",
    icon: "/wallets/bitkeep.svg",
    installUrl: "https://web3.bitget.com/",
    detect: () => Boolean(typeof window !== "undefined" && window.bitkeep),
  },
  {
    id: "ledger",
    name: "Ledger",
    chain: "Multi-Chain",
    icon: "/wallets/ledger.svg",
    installUrl: "https://www.ledger.com/",
    detect: () => false,
  },
];

interface WalletContextType {
  connected: boolean;
  address: string;
  walletName: string;
  walletIcon: string;
  chain: string;
  balance: string;
  symbol: string;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  connectWallet: (wallet: WalletOption, addr: string) => void;
  disconnectWallet: () => void;
  fetchBalance: (addr: string) => Promise<void>;
  shortAddress: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [walletName, setWalletName] = useState("Phantom");
  const [walletIcon, setWalletIcon] = useState("/wallets/phantom.svg");
  const [chain, setChain] = useState<"Solana" | "Multi-Chain" | "Ethereum">("Solana");
  const [balance, setBalance] = useState("0.00");
  const [symbol, setSymbol] = useState("SOL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch real on-chain balance from Solana public RPC or EVM RPC
  const fetchBalance = useCallback(async (addr: string) => {
    if (!addr) return;
    const isEvm = addr.startsWith("0x");
    setSymbol(isEvm ? "ETH" : "SOL");

    try {
      if (isEvm && typeof window !== "undefined" && window.ethereum) {
        const hex = await window.ethereum.request({
          method: "eth_getBalance",
          params: [addr, "latest"],
        });
        if (typeof hex === "string") {
          const eth = Number(BigInt(hex)) / 1e18;
          setBalance(eth < 0.001 && eth > 0 ? eth.toFixed(4) : eth.toFixed(3));
          return;
        }
      } else if (!isEvm) {
        const res = await fetch("https://api.mainnet-beta.solana.com", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getBalance",
            params: [addr],
          }),
        });
        const data = await res.json();
        if (data?.result?.value !== undefined) {
          const sol = data.result.value / 1e9;
          setBalance(sol < 0.001 && sol > 0 ? sol.toFixed(4) : sol.toFixed(3));
          return;
        }
      }
    } catch {
      setBalance("0.00");
    }
  }, []);

  // Restore wallet session on page reload
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedAddr = localStorage.getItem("sisy_wallet_address");
    const savedName = localStorage.getItem("sisy_wallet_name") || "Phantom";
    const savedIcon = localStorage.getItem("sisy_wallet_icon") || "/wallets/phantom.svg";
    const savedChain = (localStorage.getItem("sisy_wallet_chain") || "Solana") as any;

    if (savedAddr) {
      setAddress(savedAddr);
      setWalletName(savedName);
      setWalletIcon(savedIcon);
      setChain(savedChain);
      setConnected(true);
      fetchBalance(savedAddr);
    }
  }, [fetchBalance]);

  const connectWallet = (wallet: WalletOption, addr: string) => {
    setConnected(true);
    setAddress(addr);
    setWalletName(wallet.name);
    setWalletIcon(wallet.icon);
    setChain(wallet.chain);

    if (typeof window !== "undefined") {
      localStorage.setItem("sisy_wallet_address", addr);
      localStorage.setItem("sisy_wallet_name", wallet.name);
      localStorage.setItem("sisy_wallet_icon", wallet.icon);
      localStorage.setItem("sisy_wallet_chain", wallet.chain);
      // Keep sisy_user_id aligned with wallet address for Supabase isolation
      localStorage.setItem("sisy_user_id", addr);
    }

    fetchBalance(addr);
  };

  const disconnectWallet = () => {
    setConnected(false);
    setAddress("");
    setBalance("0.00");

    if (typeof window !== "undefined") {
      localStorage.removeItem("sisy_wallet_address");
      localStorage.removeItem("sisy_wallet_name");
      localStorage.removeItem("sisy_wallet_icon");
      localStorage.removeItem("sisy_wallet_chain");
      localStorage.removeItem("sisy_user_id");
    }
  };

  const shortAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : "";

  return (
    <WalletContext.Provider
      value={{
        connected,
        address,
        walletName,
        walletIcon,
        chain,
        balance,
        symbol,
        isModalOpen,
        setIsModalOpen,
        connectWallet,
        disconnectWallet,
        fetchBalance,
        shortAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
