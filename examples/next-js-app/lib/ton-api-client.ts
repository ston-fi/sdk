import { Client } from "@ston-fi/sdk";

export const tonApiClient = new Client({
  endpoint: process.env.TON_API_URL ?? "https://toncenter.com/api/v2/jsonRPC",
  apiKey: process.env.TON_API_KEY,
});
