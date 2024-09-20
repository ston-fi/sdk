export const DEX_VERSION = {
  v1: "v1",
} as const;

export type DEX_VERSION = (typeof DEX_VERSION)[keyof typeof DEX_VERSION];
