export { StakeNftStatus } from "@ston-fi/api";
export {
  DAY_IN_SECONDS,
  MONTH_IN_SECONDS,
} from "@ston-fi/stake-sdk";

export const STAKE_MINTER_ADDRESS =
  process.env.NEXT_PUBLIC_STAKE_MINTER_ADDRESS ??
  "EQATQPeCwtMzQ9u54nTjUNcK4n_0VRSxPOOROLf_IE0OU3XK";

export const STAKE_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_STAKE_TOKEN_ADDRESS ??
  "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO"; // STON

export const STAKE_REWARD_ADDRESS =
  process.env.NEXT_PUBLIC_STAKE_REWARD_ADDRESS ??
  "EQBX6K9aXVl3nXINCyPPL86C4ONVmQ8vK360u6dykFKXpHCa"; // GEMSTONE

export const STAKE_MIN_DURATION_MONTH = 3;

export const STAKE_MAX_DURATION_MONTH = 24;
