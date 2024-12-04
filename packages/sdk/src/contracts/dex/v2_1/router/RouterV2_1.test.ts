import { describe, expect, it } from "vitest";

import { BaseRouterV2_1 } from "./BaseRouterV2_1";
import { CPIRouterV2_1 } from "./CPIRouterV2_1";
import { RouterV2_1 } from "./RouterV2_1";
import { StableRouterV2_1 } from "./StableRouterV2_1";

const ROUTER_ADDRESS = "kQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWk0v";

describe("RouterV2_1", () => {
  it("should extends BaseRouterV2_1", () => {
    const router = RouterV2_1.create(ROUTER_ADDRESS);

    expect(router).toBeInstanceOf(BaseRouterV2_1);
  });

  describe("CPI", () => {
    it("should be instance of CPIRouterV2_1", () => {
      const router = RouterV2_1.CPI.create(ROUTER_ADDRESS);

      expect(router).toBeInstanceOf(CPIRouterV2_1);
    });
  });

  describe("Stable", () => {
    it("should be instance of StableRouterV2_1", () => {
      const router = RouterV2_1.Stable.create(ROUTER_ADDRESS);

      expect(router).toBeInstanceOf(StableRouterV2_1);
    });
  });
});
