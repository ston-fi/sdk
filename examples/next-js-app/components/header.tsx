"use client";

import Image from "next/image";

import { TonConnectButton } from "@tonconnect/ui-react";

import { Badge } from "@/components/ui/badge";
import GitBookIcon from "@/public/icons/gitbook.svg";
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
        
          <Badge className="absolute rotate-[-13deg] -right-7 -bottom-1 scale-[0.8]">
            Eswap
          </Badge>
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
