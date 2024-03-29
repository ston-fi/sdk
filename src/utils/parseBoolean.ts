import type { BN } from '@/types';

/**
 * [Docs](https://docs.ton.org/develop/func/types#absence-of-boolean-type)
 *
 * In FunC, booleans are represented as integers;
 * false is represented as 0 and true is represented as -1 (257 ones in binary notation).
 * When a condition is checked, every non-zero integer is considered a true value.
 */
export function parseBoolean(bn: BN) {
  return !bn.isZero();
}
