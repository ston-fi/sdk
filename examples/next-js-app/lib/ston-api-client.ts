import { StonApiClient } from "@ston-fi/api";

export const stonApiClient = new StonApiClient({
  baseURL: process.env.STON_API_URL ?? "https://api.ston.fi",
});
