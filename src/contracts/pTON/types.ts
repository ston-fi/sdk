import type { PtonV1 } from "./v1/PtonV1";

export interface Pton
  extends Pick<PtonV1, "address" | "getTonTransferTxParams"> {}
