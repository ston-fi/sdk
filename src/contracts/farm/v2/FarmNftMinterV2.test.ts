import TonWeb from "tonweb";
import { describe, it, expect, vi } from "vitest";

import { createMockObj } from "@/test-utils";

import { FARM_VERSION } from "../constants";

import { FarmNftMinterV2 } from "./FarmNftMinterV2";

const {
  utils: { BN, bytesToBase64, base64ToBytes },
  boc: { Cell },
} = TonWeb;

const FARM_MINTER_ADDRESS = "EQD2Lh8GOHEKxkOhe1bXFut9hI4E3QVmSl7skPFJl7KUn_iI"; // ston/ton v2 farm minter

const DEPENDENCIES = {
  address: FARM_MINTER_ADDRESS,
  tonApiClient: createMockObj<InstanceType<typeof TonWeb.HttpProvider>>(),
};

describe("FarmNftMinterV2", () => {
  describe("version", () => {
    it("should have expected static value", () => {
      expect(FarmNftMinterV2.version).toBe(FARM_VERSION.v2);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(FarmNftMinterV2.gasConstants).toMatchInlineSnapshot(
        `
        {
          "stake": "11e1a300",
          "stakeForward": "0ee6b280",
        }
      `,
      );
    });
  });

  describe("constructor", () => {
    it("should create an instance of FarmNftMinterV2", () => {
      const contract = new FarmNftMinterV2({
        ...DEPENDENCIES,
      });

      expect(contract).toBeInstanceOf(FarmNftMinterV2);
    });

    it("should create an instance of FarmNftMinterV2 with default gasConstants", () => {
      const contract = new FarmNftMinterV2({
        ...DEPENDENCIES,
      });

      expect(contract.gasConstants).toEqual(FarmNftMinterV2.gasConstants);
    });

    it("should create an instance of FarmNftMinterV2 with given gasConstants", () => {
      const gasConstants: Partial<FarmNftMinterV2["gasConstants"]> = {
        stake: new BN("1"),
      };

      const contract = new FarmNftMinterV2({
        ...DEPENDENCIES,
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("getPendingData", () => {
    const snapshot = [
      new BN("1"),
      new BN("2"),
      new BN("3"),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsEBAQEAJAAAAEOAAd6TYGI2dHO34AyjliaPEcHGq8BfAjtPpunpdaxBJTjwb9ml9Q==",
        ),
      ),
      Cell.oneFromBoc(base64ToBytes("te6ccsEBAQEAAgAAAAC1U5ck")),
      Cell.oneFromBoc(base64ToBytes("te6ccsEBAQEAAgAAAAC1U5ck")),
      Cell.oneFromBoc(base64ToBytes("te6ccsEBAQEAAgAAAAC1U5ck")),
    ];

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn().mockResolvedValue(snapshot),
    });

    it("should make on-chain request and return parsed response", async () => {
      const contract = new FarmNftMinterV2({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const data = await contract.getPendingData();

      expect(data.changeCustodianTs).toStrictEqual(new BN("1"));
      expect(data.sendMsgTs).toStrictEqual(new BN("2"));
      expect(data.codeUpgradeTs).toStrictEqual(new BN("3"));
      expect(data.newCustodian?.toString()).toMatchInlineSnapshot(
        '"0:0ef49b0311b3a39dbf00651cb134788e0e355e02f811da7d374f4bad620929c7"',
      );
      expect(
        bytesToBase64(await data.pendingMsg.toBoc()),
      ).toMatchInlineSnapshot('"te6ccsEBAQEAAgAAAAC1U5ck"');
      expect(bytesToBase64(await data.newCode.toBoc())).toMatchInlineSnapshot(
        '"te6ccsEBAQEAAgAAAAC1U5ck"',
      );
      expect(
        bytesToBase64(await data.newStorage.toBoc()),
      ).toMatchInlineSnapshot('"te6ccsEBAQEAAgAAAAC1U5ck"');
    });
  });

  describe("getVersion", () => {
    const snapshot = [
      new BN("2"),
      new BN("0"),
      Cell.oneFromBoc(base64ToBytes("te6ccsEBAQEACAAAAAxwYXRjaDHuwCOw==")),
    ];

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn().mockResolvedValue(snapshot),
    });

    it("should make on-chain request and return parsed response", async () => {
      const contract = new FarmNftMinterV2({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const data = await contract.getVersion();

      expect(data.major).toStrictEqual(2);
      expect(data.minor).toStrictEqual(0);
      expect(data.development).toStrictEqual("patch1");
    });
  });

  describe("getData", () => {
    const snapshot = [
      new BN("9729"),
      new BN("1713903185"),
      new BN("2"),
      new BN("35000000000000000000000"),
      new BN("17412779400"),
      new BN("953636587792"),
      new BN("0"),
      new BN("0"),
      new BN("34999999999874585431178"),
      new BN("33482249126223000000000"),
      new BN("691117425"),
      new BN("1261985900000000000000"),
      new BN("0"),
      new BN("1"),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsEBAQEAJAAAAEOAASnm5G9ftMULmARRaadBb09t1FazZa1y6nBcyiVbA56wciQRGQ==",
        ),
      ),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsEBAQEAJAAAAEOACcr/S0BJmdiyyuEQ9kVknDfccJ+xUZYo2EcJ11mVT++QUlpiRw==",
        ),
      ),
      Cell.oneFromBoc(
        base64ToBytes(
          "te6ccsEBAQEAJAAAAEOAE1XEnRcjRVi9UD7WrYvKkVyYXqugt8gbjnnHwqvEhL6wioVD+g==",
        ),
      ),
      new BN("-1"),
      new BN("-1"),
      new BN("-1"),
      new BN("0"),
    ];

    const tonApiClient = createMockObj<
      InstanceType<typeof TonWeb.HttpProvider>
    >({
      call2: vi.fn().mockResolvedValue(snapshot),
    });

    it("should make on-chain request and return parsed response", async () => {
      const contract = new FarmNftMinterV2({
        ...DEPENDENCIES,
        tonApiClient,
      });

      const data = await contract.getData();

      expect(data.nextItemIndex).toStrictEqual(new BN("9729"));
      expect(data.lastUpdateTime).toStrictEqual(new BN("1713903185"));
      expect(data.status).toBe(2);
      expect(data.depositedNanorewards).toStrictEqual(
        new BN("35000000000000000000000"),
      );
      expect(data.currentStakedTokens).toStrictEqual(new BN("17412779400"));
      expect(data.accruedPerUnitNanorewards).toStrictEqual(
        new BN("953636587792"),
      );
      expect(data.claimedFeeNanorewards).toStrictEqual(new BN("0"));
      expect(data.accruedFeeNanorewards).toStrictEqual(new BN("0"));
      expect(data.accruedNanorewards).toStrictEqual(
        new BN("34999999999874585431178"),
      );
      expect(data.claimedNanorewards).toStrictEqual(
        new BN("33482249126223000000000"),
      );
      expect(data.contractUniqueId).toStrictEqual(new BN("691117425"));
      expect(data.nanorewardsPer24h).toStrictEqual(
        new BN("1261985900000000000000"),
      );
      expect(data.adminFee).toStrictEqual(new BN("0"));
      expect(data.minStakeTime).toStrictEqual(new BN("1"));
      expect(data.stakingTokenWallet.toString()).toMatchInlineSnapshot(
        '"0:094f37237afda6285cc0228b4d3a0b7a7b6ea2b59b2d6b975382e6512ad81cf5"',
      );
      expect(data.rewardTokenWallet.toString()).toMatchInlineSnapshot(
        '"0:4e57fa5a024ccec596570887b22b24e1bee384fd8a8cb146c2384ebaccaa7f7c"',
      );
      expect(data.custodianAddress?.toString()).toMatchInlineSnapshot(
        '"0:9aae24e8b91a2ac5ea81f6b56c5e548ae4c2f55d05be40dc73ce3e155e2425f5"',
      );
      expect(data.canChangeCustodian).toBe(true);
      expect(data.canSendRawMsg).toBe(true);
      expect(data.canChangeFee).toBe(true);
      expect(data.unrestrictedDepositRewards).toBe(false);
    });
  });
});
