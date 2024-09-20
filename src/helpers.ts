import type { AddressType } from "@/types";
import { DEX } from "@/contracts/dex";

/**
 * Returns a set of DEX contracts for the given version of the router.
 * Useful for defining the set of contracts based on the API information about the router.
 * Throws if the version is not supported.
 *
 * @param {number} param0.majorVersion - The major version of the router.
 * @param {number} param0.minorVersion - The minor version of the router.
 *
 * @returns The set of contracts for the given version.
 */
export function dexFactory({
  majorVersion,
  minorVersion,
}: {
  majorVersion: number;
  minorVersion: number;
}) {
  if (majorVersion === 1 && minorVersion === 0) {
    return DEX.v1;
  }

  if (majorVersion === 2 && minorVersion === 1) {
    return DEX.v2_1;
  }

  throw new Error(`Unsupported dex version: ${majorVersion}.${minorVersion}`);
}

/**
 * Returns an instance of the router contract for the given version and address.
 * Useful for creating a router based on the API information about the router.
 * Throws if the version is not supported.
 *
 * @param {Address | string} param0.address - The address of the router.
 * @param {number} param0.majorVersion - The major version of the router.
 * @param {number} param0.minorVersion - The minorVersion version of the router.
 *
 * @returns {Router} The instance of the router contract.
 */
export function routerFactory({
  address,
  majorVersion,
  minorVersion,
}: {
  address: AddressType;
  majorVersion: number;
  minorVersion: number;
}) {
  const { Router } = dexFactory({ majorVersion, minorVersion });

  return new Router(address);
}
