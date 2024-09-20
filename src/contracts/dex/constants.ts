export const DEX_VERSION = {
  v1: "v1",
  v2_1: "v2_1",
} as const;

export type DEX_VERSION = (typeof DEX_VERSION)[keyof typeof DEX_VERSION];

export const DEX_TYPE = {
  CPI: "constant_product",
} as const;

export type DEX_TYPE = (typeof DEX_TYPE)[keyof typeof DEX_TYPE];
