import { TonClient } from "@ton/ton";

export const tonApiClient = new TonClient({
  endpoint: process.env.TON_API_URL ?? "https://toncenter.com/api/v2/jsonRPC",
  apiKey: process.env.TON_API_KEY,
});
