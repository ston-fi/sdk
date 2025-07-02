export const STAKE_OP_CODES = {
  STAKE: 0x6ec9dc65,
  RESTAKE: 0x1649abed,
  UNSTAKE: 0xb92965a0,
  CLAIM_REWARDS: 0x78d9f109,
} as const;

/**
 * Number of seconds in a day
 *
 * 24 hours * 60 minutes * 60 seconds = 86400 seconds
 */
export const DAY_IN_SECONDS = 86400;

/**
 * Number of seconds in a month.
 * Is calculated as an average of 4 years: `(365 * 3 + 366) * DAY_IN_SECONDS / (12 * 4)`
 *
 * 30 days * 24 hours * 60 minutes * 60 seconds = 2592000 seconds
 */
export const MONTH_IN_SECONDS = 2592000;
