import { beforeAll, describe, expect, it } from "vitest";

import { DEX_VERSION } from "@/contracts/dex/constants";
import { setup } from "@/test-utils";

import { BasePoolV2_2 } from "./BasePoolV2_2";

describe("BasePoolV2_2", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(BasePoolV2_2.version).toBe(DEX_VERSION.v2_2);
    });
  });
});
