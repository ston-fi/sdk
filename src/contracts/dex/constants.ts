export const DEX_OP_CODES = {
  SWAP: 0x25938561,
  CROSS_SWAP: 0xffffffef,
  PROVIDE_LP: 0xfcf9e58f,
  CROSS_PROVIDE_LP: 0xfffffeff,
  DIRECT_ADD_LIQUIDITY: 0x4cf82803,
  REFUND_ME: 0x0bf3f447,
  RESET_GAS: 0x42a0fb43,
  COLLECT_FEES: 0x1fcb7d3d,
  BURN: 0x595f07bc,
  WITHDRAW_FEE: 0x45ed2dc7,
} as const;

export const DEX_VERSION = {
  v1: "v1",
  v2: "v2",
} as const;

export type DEX_VERSION = (typeof DEX_VERSION)[keyof typeof DEX_VERSION];

export const DEX_TYPE = {
  CPI: "constant_product",
} as const;

export type DEX_TYPE = (typeof DEX_TYPE)[keyof typeof DEX_TYPE];
