export const TON_ADDRESS = "UQDu8T1pByMbhAfzH45f_0jCwG73D0FonjAfUMEM0Aw9LVYX";

export const TonAddressRegex =
  /(^((EQ|UQ)[a-zA-Z0-9-_]{46})$)|(^((-1|0):[a-zA-Z0-9]{64})$)/;

export const ROUTES = {
  swap: "/swap",
  vault: "/vault",
  liquidityProvide: "/liquidity/provide",
  liquidityRefund: "/liquidity/refund",
  stake: "/stake",
} as const;
