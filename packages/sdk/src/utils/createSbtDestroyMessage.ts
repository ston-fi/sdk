import { beginCell } from "@ton/ton";

import type { QueryIdType } from "../types";

/**
 * Implements `destroy` function from SBT Standard.
 * [Docs](https://github.com/ton-blockchain/TEPs/blob/master/text/0085-sbt-standard.md#3-destroy)
 *
 * ```TL-B
 * destroy#1f04537a query_id:uint64 = InternalMsgBody;
 * ```
 */
export function createSbtDestroyMessage(params?: { queryId: QueryIdType }) {
  return beginCell()
    .storeUint(0x1f04537a, 32)
    .storeUint(params?.queryId ?? 0, 64)
    .endCell();
}
