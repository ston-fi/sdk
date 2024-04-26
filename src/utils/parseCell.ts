import type { Slice } from "tonweb";
import type { Cell } from "@/types";

export function parseCell(cell: Cell) {
  // biome-ignore lint/suspicious/noExplicitAny: TonWeb types are not matching the actual implementation
  return (cell as any).beginParse() as Slice;
}
