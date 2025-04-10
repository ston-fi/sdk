import { beforeAll, describe, expect, it } from "vitest";

import { setup } from "../../../../test-utils";
import { DEX_TYPE, DEX_VERSION } from "../../constants";
import { WCPIRouterV2_2 } from "./WCPIRouterV2_2";

describe("WCPIRouterV2_2", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(WCPIRouterV2_2.version).toBe(DEX_VERSION.v2_2);
    });
  });

  describe("dexType", () => {
    it("should have expected static value", () => {
      expect(WCPIRouterV2_2.dexType).toBe(DEX_TYPE.WCPI);
    });
  });
});
