export const TON_ADDRESS = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";

export const TonAddressRegex =
  /(^((EQ|UQ)[a-zA-Z0-9-_]{46})$)|(^((-1|0):[a-zA-Z0-9]{64})$)/;

export const ROUTES = {
  swap: "/swap",
  vault: "/vault",
} as const;
