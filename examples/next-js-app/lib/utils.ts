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

/**
 * Divides a number by a given exponent of base 10 (10exponent), and formats it into a string representation of the number.
 *
 * @see [implementation by viem.](https://github.com/wevm/viem/blob/71a4e7aca259f0565005929d6584dca87bd59807/src/utils/unit/parseUnits.ts#L16)
 */
export function floatToBigNumber(value: string, decimals: number) {
  let [integer = "0", fraction = "0"] = value.split(".");

  const negative = integer.startsWith("-");

  if (negative) integer = integer.slice(1);

  fraction = fraction.padEnd(decimals, "0").slice(0, decimals);

  return BigInt(`${negative ? "-" : ""}${integer}${fraction}`);
}

/**
 * Multiplies a string representation of a number by a given exponent of base 10 (10exponent).
 *
 * @see [implementation by viem.](https://github.com/wevm/viem/blob/71a4e7aca259f0565005929d6584dca87bd59807/src/utils/unit/formatUnits.ts#L16)
 */
export function bigNumberToFloat(value: bigint | string, decimals: number) {
  let display = value.toString();

  const negative = display.startsWith("-");
  if (negative) display = display.slice(1);

  display = display.padStart(decimals, "0");

  let [integer, fraction] = [
    display.slice(0, display.length - decimals),
    display.slice(display.length - decimals),
  ];
  fraction = fraction.replace(/(0+)$/, "");

  return `${negative ? "-" : ""}${integer || "0"}${
    fraction ? `.${fraction}` : ""
  }`;
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
