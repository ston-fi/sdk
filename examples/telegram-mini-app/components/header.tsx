"use client";

import Image from "next/image";

import { TonConnectButton } from "@tonconnect/ui-react";


import GitHubIcon from "@/public/icons/github.svg";

export function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background justify-between">
      <section className="container flex items-center gap-4">
        <a
          href="https://ewap-margin.vercel.app/"
          target="_blank noopener noreferrer"
          className="hover:opacity-80 transition-opacity relative mr-auto"
        >
          <Image
            src="/icons/logoviolet.jpg"
            alt="Logo"
            width={60}
            height={60}
          />
        </a>

        <TonConnectButton />
        <a
          href="https://github.com/EAbdelilah/sdk/tree/main"
          target="_blank noopener noreferrer"
          className="hover:opacity-60 transition-opacity"
        >
          <Image src={GitHubIcon} alt="GitHub" width={24} height={24} />
        </a>
        
      </section>
    </header>
  );
}
