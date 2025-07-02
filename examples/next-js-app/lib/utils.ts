import { TonAddressRegex } from "@/constants";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a percentage to a percentage basis point (bps) value.
 */
export function percentToPercentBps(percent: number): number {
  if (percent < 0 || percent > 1) {
    throw new Error("Invalid percent value. Must be between 0 and 1.");
  }

  return percent * 100 * 100;
}

export function validateFloatValue(value: string, decimals?: number) {
  const decimalsLimit = decimals ? `{0,${decimals}}` : "*";
  const regex = new RegExp(`^([0-9]+([.][0-9]${decimalsLimit})?|[.][0-9]+)$`);
  return regex.test(value);
}

/** convert from percent value in range 0.0 - 1.0 to BPS */
export function percentToBps(percent: number) {
  return Math.floor(percent * 10000);
}

export const isValidAddress = (address: string) =>
  TonAddressRegex.test(address);
