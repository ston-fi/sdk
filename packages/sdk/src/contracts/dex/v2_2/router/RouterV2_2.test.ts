import { describe, expect, it } from "vitest";

import { BaseRouterV2_2 } from "./BaseRouterV2_2";
import { CPIRouterV2_2 } from "./CPIRouterV2_2";
import { RouterV2_2 } from "./RouterV2_2";
import { StableRouterV2_2 } from "./StableRouterV2_2";

const ROUTER_ADDRESS = "kQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWk0v";

describe("RouterV2_2", () => {
  it("should extends BaseRouterV2_2", () => {
    const router = RouterV2_2.create(ROUTER_ADDRESS);

    expect(router).toBeInstanceOf(BaseRouterV2_2);
  });

  describe("CPI", () => {
    it("should be instance of CPIRouterV2_2", () => {
      const router = RouterV2_2.CPI.create(ROUTER_ADDRESS);

      expect(router).toBeInstanceOf(CPIRouterV2_2);
    });
  });

  describe("Stable", () => {
    it("should be instance of StableRouterV2_2", () => {
      const router = RouterV2_2.Stable.create(ROUTER_ADDRESS);

      expect(router).toBeInstanceOf(StableRouterV2_2);
    });
  });
});
