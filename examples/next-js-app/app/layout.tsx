import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { Inter } from "next/font/google";

import { Header } from "@/components/header";
import { NavBar } from "@/components/nav-bar";
import { Toaster } from "@/components/ui/toaster";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const navBarLinks = [
  { href: ROUTES.swap, label: "Swap" },
  { href: ROUTES.liquidityProvide, label: "Liquidity provide" },
  { href: ROUTES.liquidityRefund, label: "Liquidity refund" },
  { href: ROUTES.vault, label: "Vault" },
  { href: ROUTES.stake, label: "Stake" },
];

export const metadata: Metadata = {
  title: "Ston.fi SDK Example app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  noStore();

  return (
    <html lang="en">
      <body className={cn(inter.className, "flex flex-col min-h-[100svh]")}>
        <Providers>
          <Header />
          <NavBar className="mx-auto" links={navBarLinks} />
          <main className="container flex flex-col flex-1 h-full py-10">
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
