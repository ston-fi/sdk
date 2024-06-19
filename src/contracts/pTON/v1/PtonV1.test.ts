import { describe, expect, it } from "vitest";

import { pTON_VERSION } from "../constants";

import { PtonV1 } from "./PtonV1";

describe("PtonV1", () => {
  describe("version", () => {
    it("should have expected static value", () => {
      expect(PtonV1.version).toBe(pTON_VERSION.v1);
    });
  });

  describe("address", () => {
    it("should have expected static value", () => {
      expect(PtonV1.address.toString()).toMatchInlineSnapshot(
        '"EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez"',
      );
    });
  });

  describe("create", () => {
    it("should create an instance of PtonV1", () => {
      const contract = PtonV1.create(PtonV1.address);

      expect(contract).toBeInstanceOf(PtonV1);
    });
  });

  describe("constructor", () => {
    it("should create an instance of PtonV1", () => {
      const contract = new PtonV1();

      expect(contract).toBeInstanceOf(PtonV1);
    });

    it("should create an instance of PtonV1 with default address", () => {
      const contract = new PtonV1();

      expect(contract.address).toEqual(PtonV1.address);
    });

    it("should create an instance of RouterV1 with given address", () => {
      const address = "EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i"; // just an address, not a real pTON v1 contract

      const contract = new PtonV1(address);

      expect(contract.address.toString()).toEqual(address);
    });
  });
});
