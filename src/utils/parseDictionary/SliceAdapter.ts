import type { Slice } from "tonweb";

import type { Cell } from "@/types";
import { parseCell } from "@/utils/parseCell";

export class SliceAdapter {
  slice: Slice;
  refs: Cell[];

  constructor(cell: Cell) {
    this.slice = parseCell(cell);
    this.refs = [...cell.refs];
  }

  loadBit() {
    return this.slice.loadBit();
  }

  loadUint(bits: number) {
    return this.slice.loadUint(bits).toNumber();
  }

  loadUintBN(bits: number) {
    return this.slice.loadUint(bits);
  }

  loadRef(): Cell {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    return this.refs.shift()!;
  }
}

export function beginParse(cell: Cell) {
  return new SliceAdapter(cell);
}
