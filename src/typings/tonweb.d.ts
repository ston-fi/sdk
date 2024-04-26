import "tonweb";

declare module "tonweb" {
  type Address = InstanceType<typeof TonWeb.utils.Address>;
  type BN = InstanceType<typeof TonWeb.utils.BN>;

  export class Slice {
    constructor(array: Uint8Array, length: number, refs: Slice[]);

    getFreeBits(): number;

    checkRange(n: number): void;

    get(n: number): boolean;

    loadBit(): boolean;

    loadBits(bitLength: number): Uint8Array;

    loadUint(bitLength: number): BN;

    loadInt(bitLength: number): BN;

    loadVarUint(bitLength: number): BN;

    loadCoins(): BN;

    loadAddress(): Address;

    loadRef(): Slice;
  }
}
