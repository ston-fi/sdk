import { beforeAll, describe, expect, it } from "vitest";

import { setup } from "../../../../test-utils";
import { DEX_TYPE, DEX_VERSION } from "../../constants";
import { WCPIPoolV2_2 } from "./WCPIPoolV2_2";

describe("WCPIPoolV2_2", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(WCPIPoolV2_2.version).toBe(DEX_VERSION.v2_2);
    });
  });

  describe("dexType", () => {
    it("should have expected static value", () => {
      expect(WCPIPoolV2_2.dexType).toBe(DEX_TYPE.WCPI);
    });
  });
});
