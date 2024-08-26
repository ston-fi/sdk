export const pTON_OP_CODES = {
  DEPLOY_WALLET_V1: 0x6cc43573,
} as const;

export const pTON_VERSION = {
  v1: "v1",
} as const;

export type pTON_VERSION = (typeof pTON_VERSION)[keyof typeof pTON_VERSION];
