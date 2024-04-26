import type { BN, Cell } from "@/types";

import { beginParse, type SliceAdapter } from "./SliceAdapter";
import { parseDict } from "./DeserializeDictionary";

export function parseDictionaryCell(cell: Cell, keySize: number) {
  const valueParse = (src: SliceAdapter) => {
    return src.loadRef();
  };

  return parseDict<Cell>(beginParse(cell), keySize, valueParse);
}

export function parseDictionaryUint(
  cell: Cell,
  keySize: number,
  valueSize: number,
) {
  const valueParse = (src: SliceAdapter) => {
    return src.loadUintBN(valueSize);
  };

  return parseDict<BN>(beginParse(cell), keySize, valueParse);
}
