export const pTON_OP_CODES = {
  TON_TRANSFER: 0x01f3835d,
  DEPLOY_WALLET_V1: 0x6cc43573,
  DEPLOY_WALLET_V2: 0x4f5f4313,
} as const;

export const pTON_VERSION = {
  v1: "v1",
  v2: "v2",
} as const;

export type pTON_VERSION = (typeof pTON_VERSION)[keyof typeof pTON_VERSION];
