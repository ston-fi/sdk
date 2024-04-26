import type { Cell } from "@/types";

export function parseString(cell: Cell): string {
  const decoder = new TextDecoder();
  return decoder.decode(cell.bits.getTopUppedArray());
}
