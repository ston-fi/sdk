import { beforeAll, describe, expect, it } from "vitest";

import {
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "@/test-utils";

import { FARM_VERSION } from "../constants";

import { FarmNftMinterV2 } from "./FarmNftMinterV2";

const FARM_MINTER_ADDRESS = "EQD2Lh8GOHEKxkOhe1bXFut9hI4E3QVmSl7skPFJl7KUn_iI"; // ston/ton v2 farm minter

describe("FarmNftMinterV2", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(FarmNftMinterV2.version).toBe(FARM_VERSION.v2);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(FarmNftMinterV2.gasConstants.stake).toMatchInlineSnapshot(
        "300000000n",
      );
      expect(FarmNftMinterV2.gasConstants.stakeForward).toMatchInlineSnapshot(
        "250000000n",
      );
    });
  });

  describe("create", () => {
    it("should create an instance of FarmNftMinterV2 from address", () => {
      const contract = FarmNftMinterV2.create(FARM_MINTER_ADDRESS);

      expect(contract).toBeInstanceOf(FarmNftMinterV2);
    });
  });

  describe("constructor", () => {
    it("should create an instance of FarmNftMinterV2", () => {
      const contract = FarmNftMinterV2.create(FARM_MINTER_ADDRESS);

      expect(contract).toBeInstanceOf(FarmNftMinterV2);
    });

    it("should create an instance of FarmNftMinterV2 with default gasConstants", () => {
      const contract = FarmNftMinterV2.create(FARM_MINTER_ADDRESS);

      expect(contract.gasConstants).toEqual(FarmNftMinterV2.gasConstants);
    });

    it("should create an instance of FarmNftMinterV2 with given gasConstants", () => {
      const gasConstants: Partial<FarmNftMinterV2["gasConstants"]> = {
        stake: BigInt("1"),
      };

      const contract = new FarmNftMinterV2(FARM_MINTER_ADDRESS, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("getPendingData", () => {
    const snapshot = createProviderSnapshot()
      .number("1")
      .number("2")
      .number("3")
      .cell(
        "te6ccsEBAQEAJAAAAEOAAd6TYGI2dHO34AyjliaPEcHGq8BfAjtPpunpdaxBJTjwb9ml9Q==",
      )
      .cell("te6ccsEBAQEAAgAAAAC1U5ck")
      .cell("te6ccsEBAQEAAgAAAAC1U5ck")
      .cell("te6ccsEBAQEAAgAAAAC1U5ck");
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(
        FarmNftMinterV2.create(FARM_MINTER_ADDRESS),
      );

      const data = await contract.getPendingData();

      expect(data.changeCustodianTs).toMatchInlineSnapshot("1n");
      expect(data.sendMsgTs).toMatchInlineSnapshot("2n");
      expect(data.codeUpgradeTs).toMatchInlineSnapshot("3n");
      expect(data.newCustodian?.toRawString()).toMatchInlineSnapshot(
        '"0:0ef49b0311b3a39dbf00651cb134788e0e355e02f811da7d374f4bad620929c7"',
      );
      expect(data.pendingMsg.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAAgAAAEysuc0="',
      );
      expect(data.newCode.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAAgAAAEysuc0="',
      );
      expect(data.newStorage.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEAAgAAAEysuc0="',
      );
    });
  });

  describe("getVersion", () => {
    const snapshot = createProviderSnapshot()
      .number("2")
      .number("0")
      .cell("te6ccsEBAQEACAAAAAxwYXRjaDHuwCOw==");
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(
        FarmNftMinterV2.create(FARM_MINTER_ADDRESS),
      );

      const data = await contract.getVersion();

      expect(data.major).toStrictEqual(2);
      expect(data.minor).toStrictEqual(0);
      expect(data.development).toStrictEqual("patch1");
    });
  });

  describe("getFarmingMinterData", () => {
    const snapshot = createProviderSnapshot()
      .number("9729")
      .number("1713903185")
      .number("2")
      .number("35000000000000000000000")
      .number("17412779400")
      .number("953636587792")
      .number("0")
      .number("0")
      .number("34999999999874585431178")
      .number("33482249126223000000000")
      .number("691117425")
      .number("1261985900000000000000")
      .number("0")
      .number("1")
      .cell(
        "te6ccsEBAQEAJAAAAEOAASnm5G9ftMULmARRaadBb09t1FazZa1y6nBcyiVbA56wciQRGQ==",
      )
      .cell(
        "te6ccsEBAQEAJAAAAEOACcr/S0BJmdiyyuEQ9kVknDfccJ+xUZYo2EcJ11mVT++QUlpiRw==",
      )
      .cell(
        "te6ccsEBAQEAJAAAAEOAE1XEnRcjRVi9UD7WrYvKkVyYXqugt8gbjnnHwqvEhL6wioVD+g==",
      )
      .number("-1")
      .number("-1")
      .number("-1")
      .number("0");
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(
        FarmNftMinterV2.create(FARM_MINTER_ADDRESS),
      );

      const data = await contract.getFarmingMinterData();

      expect(data.nextItemIndex).toMatchInlineSnapshot("9729n");
      expect(data.lastUpdateTime).toMatchInlineSnapshot("1713903185n");
      expect(data.status).toBe(2);
      expect(data.depositedNanorewards).toMatchInlineSnapshot(
        "35000000000000000000000n",
      );
      expect(data.currentStakedTokens).toMatchInlineSnapshot("17412779400n");
      expect(data.accruedPerUnitNanorewards).toMatchInlineSnapshot(
        "953636587792n",
      );
      expect(data.claimedFeeNanorewards).toMatchInlineSnapshot("0n");
      expect(data.accruedFeeNanorewards).toMatchInlineSnapshot("0n");
      expect(data.accruedNanorewards).toMatchInlineSnapshot(
        "34999999999874585431178n",
      );
      expect(data.claimedNanorewards).toMatchInlineSnapshot(
        "33482249126223000000000n",
      );
      expect(data.contractUniqueId).toMatchInlineSnapshot("691117425n");
      expect(data.nanorewardsPer24h).toMatchInlineSnapshot(
        "1261985900000000000000n",
      );
      expect(data.adminFee).toMatchInlineSnapshot("0n");
      expect(data.minStakeTime).toMatchInlineSnapshot("1n");
      expect(data.stakingTokenWallet.toRawString()).toMatchInlineSnapshot(
        '"0:094f37237afda6285cc0228b4d3a0b7a7b6ea2b59b2d6b975382e6512ad81cf5"',
      );
      expect(data.rewardTokenWallet.toRawString()).toMatchInlineSnapshot(
        '"0:4e57fa5a024ccec596570887b22b24e1bee384fd8a8cb146c2384ebaccaa7f7c"',
      );
      expect(data.custodianAddress?.toRawString()).toMatchInlineSnapshot(
        '"0:9aae24e8b91a2ac5ea81f6b56c5e548ae4c2f55d05be40dc73ce3e155e2425f5"',
      );
      expect(data.canChangeCustodian).toBe(true);
      expect(data.canSendRawMsg).toBe(true);
      expect(data.canChangeFee).toBe(true);
      expect(data.unrestrictedDepositRewards).toBe(false);
    });
  });
});
