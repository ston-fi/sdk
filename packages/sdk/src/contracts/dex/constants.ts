export const DEX_VERSION = {
  v1: "v1",
  /**
   * We recommend using `v2_1` contracts
   * only for withdrawal functionality on already deployed contracts.
   * @see https://t.me/stonfidex/712
   */
  v2_1: "v2_1",
  v2_2: "v2_2",
} as const;

export type DEX_VERSION = (typeof DEX_VERSION)[keyof typeof DEX_VERSION];

export const DEX_TYPE = {
  CPI: "constant_product",
  Stable: "stableswap",
} as const;

export type DEX_TYPE = (typeof DEX_TYPE)[keyof typeof DEX_TYPE];
