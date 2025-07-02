import { TonApiClient } from "@ton-api/client";

export const tonConsoleClient = new TonApiClient({
  baseUrl: process.env.TON_CONSOLE_API_URL ?? "https://tonapi.io",
  apiKey: process.env.TON_CONSOLE_API_KEY,
});
