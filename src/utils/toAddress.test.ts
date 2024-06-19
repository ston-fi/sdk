import { describe, it, expect } from "vitest";
import { Address, address, Cell } from "@ton/ton";

import { toAddress } from "./toAddress";

const TEST_ADDRESS_STR = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";

describe("toAddress", () => {
  it("should return Address instance if Address instance is passed", () => {
    const addressSource = address(TEST_ADDRESS_STR);

    expect(toAddress(addressSource)).toBe(addressSource);
  });

  it("should return Address instance if string is passed", () => {
    const addressSource = TEST_ADDRESS_STR;

    const result = toAddress(addressSource);

    expect(result).toBeInstanceOf(Address);
    expect(result.toString()).toBe(address(TEST_ADDRESS_STR).toString());
  });

  it("should return Address instance by converting passed address to string", () => {
    const addressSource = { toString: () => TEST_ADDRESS_STR };

    // @ts-expect-error - we are passing non-Address instance here to test the edge case
    // bui it should work as expected because we are using `toString` method
    const result = toAddress(addressSource);

    expect(result).toBeInstanceOf(Address);
    expect(result.toString()).toBe(address(TEST_ADDRESS_STR).toString());
  });
});
