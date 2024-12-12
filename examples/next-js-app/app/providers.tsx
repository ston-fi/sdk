"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { THEME, TonConnectUIProvider } from "@tonconnect/ui-react";
import type React from "react";

export const queryClient = new QueryClient();

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
      <QueryProvider>{children}</QueryProvider>
    </TonConnectProvider>
  );
}
