import type TonWeb from "tonweb";
import { describe, it, expect, vi } from "vitest";

import { createMockObj } from "@/test-utils";

import { pTON_VERSION } from "../constants";

import { PtonV1 } from "./PtonV1";

const DEPENDENCIES = {
  tonApiClient: createMockObj<InstanceType<typeof TonWeb.HttpProvider>>(),
};

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

  describe("constructor", () => {
    it("should create an instance of PtonV1", () => {
      const contract = new PtonV1({
        ...DEPENDENCIES,
      });

      expect(contract).toBeInstanceOf(PtonV1);
    });
  });
});
