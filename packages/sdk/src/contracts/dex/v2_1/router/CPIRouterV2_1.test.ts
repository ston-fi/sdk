import { beforeAll, describe, expect, it } from "vitest";

import {
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "../../../../test-utils";
import { DEX_TYPE, DEX_VERSION } from "../../constants";
import { CPIPoolV2_1 } from "../pool/CPIPoolV2_1";
import { VaultV2_1 } from "../vault/VaultV2_1";
import { CPIRouterV2_1 } from "./CPIRouterV2_1";

const USER_WALLET_ADDRESS = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";
const ROUTER_ADDRESS = "kQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWk0v";
const OFFER_JETTON_ADDRESS = "kQDLvsZol3juZyOAVG8tWsJntOxeEZWEaWCbbSjYakQpuYN5"; // TestRED
const ASK_JETTON_ADDRESS = "kQB_TOJSB7q3-Jm1O8s0jKFtqLElZDPjATs5uJGsujcjznq3"; // TestBLUE

describe("CPIRouterV2_1", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(CPIRouterV2_1.version).toBe(DEX_VERSION.v2_1);
    });
  });

  describe("dexType", () => {
    it("should have expected static value", () => {
      expect(CPIRouterV2_1.dexType).toBe(DEX_TYPE.CPI);
    });
  });

  describe("getPool", () => {
    it("should return Pool instance with expected version", async () => {
      const snapshot = createProviderSnapshot().cell(
        "te6cckEBAQEAJAAAQ4AbKt2Bb3pHS8bNc829uKGQg9yvKLmEqSKo9NUV1pdmHRDqCLOi",
      );
      const provider = createMockProviderFromSnapshot(snapshot);

      const contract = provider.open(CPIRouterV2_1.create(ROUTER_ADDRESS));

      const pool = await contract.getPool({
        token0: OFFER_JETTON_ADDRESS,
        token1: ASK_JETTON_ADDRESS,
      });

      expect(pool).toBeInstanceOf(CPIPoolV2_1);
    });
  });

  describe("getVault", () => {
    it("should return Vault instance with expected version", async () => {
      const snapshot = createProviderSnapshot().cell(
        "te6cckEBAQEAJAAAQ4APnbYFk/sHIc85nyovU2iRke85JwO8rxYn6ilYMKhtfzAcWMdK",
      );
      const provider = createMockProviderFromSnapshot(snapshot);

      const contract = provider.open(CPIRouterV2_1.create(ROUTER_ADDRESS));

      const vault = await contract.getVault({
        user: USER_WALLET_ADDRESS,
        tokenMinter: OFFER_JETTON_ADDRESS,
      });

      expect(vault).toBeInstanceOf(VaultV2_1);
    });
  });
});
