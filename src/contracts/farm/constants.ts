export const FARM_OP_CODES = {
  STAKE: 0x6ec9dc65,
  CLAIM_REWARDS: 0x78d9f109,
  UNSTAKE: 0xb92965a0,
} as const;

export const FARM_VERSION = {
  v1: "v1",
  v2: "v2",
  v3: "v3",
} as const;

export type FARM_VERSION = (typeof FARM_VERSION)[keyof typeof FARM_VERSION];
