import { beforeAll, describe, expect, it } from "vitest";

import { setup } from "../../../../test-utils";
import { DEX_TYPE, DEX_VERSION } from "../../constants";
import { WCPIRouterV2_1 } from "./WCPIRouterV2_1";

describe("WCPIRouterV2_1", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(WCPIRouterV2_1.version).toBe(DEX_VERSION.v2_1);
    });
  });

  describe("dexType", () => {
    it("should have expected static value", () => {
      expect(WCPIRouterV2_1.dexType).toBe(DEX_TYPE.WCPI);
    });
  });
});
