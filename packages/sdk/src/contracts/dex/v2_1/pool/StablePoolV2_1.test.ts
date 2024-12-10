import { beforeAll, describe, expect, it } from "vitest";

import {
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "../../../../test-utils";
import { DEX_TYPE, DEX_VERSION } from "../../constants";
import { LpAccountV2_1 } from "../LpAccount/LpAccountV2_1";
import { StablePoolV2_1 } from "./StablePoolV2_1";

const USER_WALLET_ADDRESS = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";
const POOL_ADDRESS = "kQDZVuwLe9I6XjZrnm3txQyEHuV5RcwlSRVHpqiutLsw6HR7"; // TestRED/TestBLUE pool

describe("StablePoolV2_1", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(StablePoolV2_1.version).toBe(DEX_VERSION.v2_1);
    });
  });

  describe("dexType", () => {
    it("should have expected static value", () => {
      expect(StablePoolV2_1.dexType).toBe(DEX_TYPE.Stable);
    });
  });

  describe("getLpAccount", () => {
    it("should return LpAccount instance with expected version", async () => {
      const snapshot = createProviderSnapshot().cell(
        "te6cckEBAQEAJAAAQ4AVCq1wcAqyiCdZCD0uy2zlKSKJURP53P8BGQXdhxOazjC3iKkE",
      );
      const provider = createMockProviderFromSnapshot(snapshot);

      const contract = provider.open(StablePoolV2_1.create(POOL_ADDRESS));

      const lpAccount = await contract.getLpAccount({
        ownerAddress: USER_WALLET_ADDRESS,
      });

      expect(lpAccount).toBeInstanceOf(LpAccountV2_1);
    });
  });
});
