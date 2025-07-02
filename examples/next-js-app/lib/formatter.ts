import { fromUnits } from "@ston-fi/sdk";

export const Formatter = {
  units: (value: bigint | string, decimals: number) => {
    return fromUnits(BigInt(value), decimals);
  },
  fiatAmount: (value: number, options: { currency?: string } = {}) => {
    const currency = options.currency ?? "USD";

    const formatter = new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

    return formatter.format(value);
  },
  address: (value: string, options: { truncateSize?: number } = {}) => {
    const truncateSize = options.truncateSize ?? 4;

    const fullAddress = value.toString();

    return [
      fullAddress.substring(0, truncateSize),
      fullAddress.substring(fullAddress.length - truncateSize),
    ].join("…");
  },
  percent: (value: number) => {
    const formatter = new Intl.NumberFormat("en", {
      style: "percent",
      maximumFractionDigits: 2,
    });

    return formatter.format(value);
  },
};
