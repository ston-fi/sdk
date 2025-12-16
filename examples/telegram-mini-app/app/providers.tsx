"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { THEME, TonConnectUIProvider } from "@tonconnect/ui-react";
import dynamic from "next/dynamic";
import type React from "react";

export const queryClient = new QueryClient();

const TelegramInit = dynamic(
  () => import("@/telegram/client/TelegramInit"),
  {
    ssr: false,
  },
);

const AnalyticsInit = dynamic(
  () => import("@/telegram/client/AnalyticsInit"),
  {
    ssr: false,
  },
);

function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

function TonConnectProvider({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider
      uiPreferences={{
        borderRadius: "s",
        theme: THEME.LIGHT,
      }}
      manifestUrl="https://sdk-demo-app.ston.fi/tonconnect-manifest.json"
    >
      {children}
    </TonConnectUIProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectProvider>
      <TelegramInit />
      <AnalyticsInit />
      <QueryProvider>{children}</QueryProvider>
    </TonConnectProvider>
  );
}
