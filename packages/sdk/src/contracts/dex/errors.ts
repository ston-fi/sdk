import type { pTON_VERSION } from "../pTON/constants";

export class UnmatchedPtonVersion extends Error {
  constructor({
    expected,
    received,
  }: {
    expected: pTON_VERSION;
    received: pTON_VERSION;
  }) {
    super(
      `The version of the provided pTON (${received}) does not match the expected version (${expected})`,
    );
  }
}
