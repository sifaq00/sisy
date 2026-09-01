import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { WalletProvider } from "@/context/WalletContext";
import WalletModal from "@/components/app/WalletModal";

export const metadata: Metadata = {
  title: "sisy — The endless mountain of work, organized.",
  description:
    "A modern task & schedule optimizer with Solana Web3 wallet login, DAG dependency resolution, and realtime multi-device sync.",
  keywords: ["task manager", "motion", "solana", "web3 wallet", "schedule optimizer", "gantt", "time tracking"],
  openGraph: {
    title: "sisy — The endless mountain of work, organized.",
    description: "Personal task & schedule optimizer with Solana wallet login and realtime sync.",
    url: "https://sisy.app",
    siteName: "Sisy",
    images: [
      {
        url: "/icon.svg",
        width: 1200,
        height: 630,
        alt: "Sisy Task & Schedule Optimizer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "sisy — The endless mountain of work, organized.",
    description: "Personal task & schedule optimizer with Solana wallet login and realtime sync.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#F5F0E4] text-[#211F1A] antialiased" suppressHydrationWarning>
        <WalletProvider>
          <SmoothScroll />
          {children}
          <WalletModal />
        </WalletProvider>
      </body>
    </html>
  );
}
