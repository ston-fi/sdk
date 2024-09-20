export const DEX_OP_CODES = {
  SWAP: 0x6664de2a,
  CROSS_SWAP: 0x69cf1a5b,
  PROVIDE_LP: 0x37c096df,
  DIRECT_ADD_LIQUIDITY: 0xff8bfc6,
  REFUND_ME: 0x132b9a2c,
  RESET_GAS: 0x29d22935,
  COLLECT_FEES: 0x1ee4911e,
  BURN: 0x595f07bc,
  WITHDRAW_FEE: 0x354bcdf4,
} as const;

export const TX_DEADLINE = 15 * 60; // 15 minutes
