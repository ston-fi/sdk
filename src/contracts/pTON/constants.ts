export const pTON_VERSION = {
  v1: "v1",
} as const;

export type pTON_VERSION = (typeof pTON_VERSION)[keyof typeof pTON_VERSION];
