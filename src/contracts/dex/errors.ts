import type { DEX_VERSION } from "./constants";

export class UnmatchedPtonVersion extends Error {
  constructor({
    expected,
    received,
  }: {
    expected: DEX_VERSION;
    received: DEX_VERSION;
  }) {
    super(
      `The version of the provided pTON (${received}) does not match the expected version (${expected})`,
    );
  }
}
