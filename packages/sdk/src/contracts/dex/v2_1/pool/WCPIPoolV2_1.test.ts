import { beforeAll, describe, expect, it } from "vitest";

import { setup } from "../../../../test-utils";
import { DEX_TYPE, DEX_VERSION } from "../../constants";
import { WCPIPoolV2_1 } from "./WCPIPoolV2_1";

describe("WCPIPoolV2_1", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(WCPIPoolV2_1.version).toBe(DEX_VERSION.v2_1);
    });
  });

  describe("dexType", () => {
    it("should have expected static value", () => {
      expect(WCPIPoolV2_1.dexType).toBe(DEX_TYPE.WCPI);
    });
  });
});
