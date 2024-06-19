import { beforeAll, describe, expect, it, vi } from "vitest";
import type { Sender } from "@ton/ton";

import {
  createMockProvider,
  createMockObj,
  createMockProviderFromSnapshot,
  createProviderSnapshot,
  setup,
} from "@/test-utils";
import { toAddress } from "@/utils/toAddress";

import { FARM_VERSION } from "../constants";

import { FarmNftMinterV1 } from "./FarmNftMinterV1";

const FARM_MINTER_ADDRESS = "EQCgKwUFWHhKyUUYBeG1PokxWhAtFyp5VcxU-sMXBrqma80u"; // ston/ton v1 farm minter
const FARM_TOKEN = "EQDtZHOtVWaf9UIU6rmjLPNLTGxNLNogvK5xUZlMRgZwQ4Gt"; // ston/ton LP token
const USER_WALLET_ADDRESS = "UQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaEAn";

describe("FarmNftMinterV1", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(FarmNftMinterV1.version).toBe(FARM_VERSION.v1);
    });
  });

  describe("gasConstants", () => {
    it("should have expected static value", () => {
      expect(FarmNftMinterV1.gasConstants.stake).toMatchInlineSnapshot(
        "300000000n",
      );
      expect(FarmNftMinterV1.gasConstants.stakeForward).toMatchInlineSnapshot(
        "250000000n",
      );
    });
  });

  describe("create", () => {
    it("should create an instance of FarmNftMinterV1 from address", () => {
      const contract = FarmNftMinterV1.create(FARM_MINTER_ADDRESS);

      expect(contract).toBeInstanceOf(FarmNftMinterV1);
    });
  });

  describe("constructor", () => {
    it("should create an instance of FarmNftMinterV1", () => {
      const contract = FarmNftMinterV1.create(FARM_MINTER_ADDRESS);

      expect(contract).toBeInstanceOf(FarmNftMinterV1);
    });

    it("should create an instance of FarmNftMinterV1 with default gasConstants", () => {
      const contract = FarmNftMinterV1.create(FARM_MINTER_ADDRESS);

      expect(contract.gasConstants).toEqual(FarmNftMinterV1.gasConstants);
    });

    it("should create an instance of FarmNftMinterV1 with given gasConstants", () => {
      const gasConstants: Partial<FarmNftMinterV1["gasConstants"]> = {
        stake: BigInt("1"),
      };

      const contract = new FarmNftMinterV1(FARM_MINTER_ADDRESS, {
        gasConstants,
      });

      expect(contract.gasConstants).toEqual(
        expect.objectContaining(gasConstants),
      );
    });
  });

  describe("createStakeBody", () => {
    it("should build expected tx body", async () => {
      const contract = FarmNftMinterV1.create(FARM_MINTER_ADDRESS);

      const body = await contract.createStakeBody();

      expect(body.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAQEABgAACG7J3GVciccs"',
      );
    });
  });

  describe("getStakeTxParams", () => {
    const txArgs = {
      userWalletAddress: USER_WALLET_ADDRESS,
      jettonAddress: FARM_TOKEN,
      jettonAmount: "1000000000",
    };

    const snapshot = createProviderSnapshot().cell(
      "te6ccsEBAQEAJAAAAEOAHFQxcq1rJvR/WddZfRdbC3/v2+tY+uTSBzqdnLahlpIwAkKqkA==",
    );

    const provider = createMockProviderFromSnapshot(snapshot);

    it("should build expected tx params", async () => {
      const contract = provider.open(
        FarmNftMinterV1.create(FARM_MINTER_ADDRESS),
      );

      const txParams = await contract.getStakeTxParams({
        ...txArgs,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQDioYuVa1k3o_rOusvouthb_37fWsfXJpA51OzltQy0kY_K"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAYQABsA+KfqUAAAAAAAAAAEO5rKAIAUBWCgqw8JWSijALw2p9EmK0IFouVPKrmKn1hi4NdUzXAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCB3NZQEBAAhuydxlZA2n6g=="',
      );
      expect(txParams.value).toBe(contract.gasConstants.stake);
    });

    it("should build expected tx params when queryId is defined", async () => {
      const contract = provider.open(
        FarmNftMinterV1.create(FARM_MINTER_ADDRESS),
      );

      const txParams = await contract.getStakeTxParams({
        ...txArgs,
        queryId: 12345,
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQDioYuVa1k3o_rOusvouthb_37fWsfXJpA51OzltQy0kY_K"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAYQABsA+KfqUAAAAAAAAwOUO5rKAIAUBWCgqw8JWSijALw2p9EmK0IFouVPKrmKn1hi4NdUzXAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCB3NZQEBAAhuydxlsqg0AA=="',
      );
      expect(txParams.value).toBe(contract.gasConstants.stake);
    });

    it("should build expected tx params when custom gasAmount is defined", async () => {
      const contract = provider.open(
        FarmNftMinterV1.create(FARM_MINTER_ADDRESS),
      );

      const txParams = await contract.getStakeTxParams({
        ...txArgs,
        gasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQDioYuVa1k3o_rOusvouthb_37fWsfXJpA51OzltQy0kY_K"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAYQABsA+KfqUAAAAAAAAAAEO5rKAIAUBWCgqw8JWSijALw2p9EmK0IFouVPKrmKn1hi4NdUzXAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCB3NZQEBAAhuydxlZA2n6g=="',
      );
      expect(txParams.value).toMatchInlineSnapshot("1n");
    });

    it("should build expected tx params when custom forwardGasAmount is defined", async () => {
      const contract = provider.open(
        FarmNftMinterV1.create(FARM_MINTER_ADDRESS),
      );

      const txParams = await contract.getStakeTxParams({
        ...txArgs,
        forwardGasAmount: "1",
      });

      expect(txParams.to).toMatchInlineSnapshot(
        '"EQDioYuVa1k3o_rOusvouthb_37fWsfXJpA51OzltQy0kY_K"',
      );
      expect(txParams.body?.toBoc().toString("base64")).toMatchInlineSnapshot(
        '"te6cckEBAgEAXgABqg+KfqUAAAAAAAAAAEO5rKAIAUBWCgqw8JWSijALw2p9EmK0IFouVPKrmKn1hi4NdUzXAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaAgMBAAhuydxlXsFjsw=="',
      );
      expect(txParams.value).toBe(contract.gasConstants.stake);
    });
  });

  describe("sendStake", () => {
    it("should call getStakeTxParams and pass the result to the sender", async () => {
      const txArgs = {} as Parameters<FarmNftMinterV1["sendStake"]>[2];

      const contract = FarmNftMinterV1.create(FARM_MINTER_ADDRESS);

      const getStakeTxParams = vi.spyOn(contract, "getStakeTxParams");

      const txParams = {} as Awaited<
        ReturnType<typeof contract.getStakeTxParams>
      >;

      getStakeTxParams.mockResolvedValue(txParams);

      const provider = createMockProvider();
      const sender = createMockObj<Sender>({
        send: vi.fn(),
      });

      await contract.sendStake(provider, sender, txArgs);

      expect(getStakeTxParams).toHaveBeenCalledWith(provider, txArgs);
      expect(sender.send).toHaveBeenCalledWith(txParams);
    });
  });

  describe("getFarmingMinterData", () => {
    const snapshot = createProviderSnapshot()
      .number("1005")
      .number("1713448141")
      .number("3")
      .number("30000000000000000000000")
      .number("280398564")
      .number("539726098095")
      .number("29999999999958353284279")
      .number("29934432992205000000000")
      .number("2072561916")
      .number("666666666666000000000")
      .number("-1")
      .number("1209600")
      .cell(
        "te6ccsEBAQEAJAAAAEOAF35ujiwyudcUiX1+gWS4fiO9LZtBrxq2cTbdZNGxLdfwQ7uV5g==",
      )
      .cell(
        "te6ccsEBAQEAJAAAAEOAFCyYWNtTp3aw84nTIdXjpji+YMz/7pdk7+oJ6jAzL2LQaiqkuA==",
      );
    const provider = createMockProviderFromSnapshot(snapshot);

    it("should make on-chain request and return parsed response", async () => {
      const contract = provider.open(
        FarmNftMinterV1.create(FARM_MINTER_ADDRESS),
      );

      const data = await contract.getFarmingMinterData();

      expect(data.nextItemIndex).toMatchInlineSnapshot("1005n");
      expect(data.lastUpdateTime).toMatchInlineSnapshot("1713448141n");
      expect(data.status).toBe(3);
      expect(data.depositedNanorewards).toMatchInlineSnapshot(
        "30000000000000000000000n",
      );
      expect(data.currentStakedTokens).toMatchInlineSnapshot("280398564n");
      expect(data.accruedPerUnitNanorewards).toMatchInlineSnapshot(
        "539726098095n",
      );
      expect(data.accruedNanorewards).toMatchInlineSnapshot(
        "29999999999958353284279n",
      );
      expect(data.claimedNanorewards).toMatchInlineSnapshot(
        "29934432992205000000000n",
      );
      expect(data.contractUniqueId).toMatchInlineSnapshot("2072561916n");
      expect(data.nanorewardsPer24h).toMatchInlineSnapshot(
        "666666666666000000000n",
      );
      expect(data.soulboundItems).toBe(true);
      expect(data.minStakeTime).toMatchInlineSnapshot("1209600n");
      expect(data.stakingTokenWallet).toMatchInlineSnapshot(
        '"EQC783RxYZXOuKRL6_QLJcPxHels2g141bOJtusmjYluv5Kt"',
      );
      expect(data.rewardTokenWallet).toMatchInlineSnapshot(
        '"EQChZMLG2p07tYecTpkOrx0xxfMGZ_90uyd_UE9RgZl7FqGt"',
      );
    });
  });

  describe("getStakingJettonAddress", () => {
    it("should make on-chain request and return parsed response", async () => {
      const provider = createMockProviderFromSnapshot((address, method) => {
        if (
          address === FARM_MINTER_ADDRESS &&
          method === "get_farming_minter_data"
        ) {
          return createProviderSnapshot()
            .number("1005")
            .number("1713448141")
            .number("3")
            .number("30000000000000000000000")
            .number("280398564")
            .number("539726098095")
            .number("29999999999958353284279")
            .number("29934432992205000000000")
            .number("2072561916")
            .number("666666666666000000000")
            .number("-1")
            .number("1209600")
            .cell(
              "te6ccsEBAQEAJAAAAEOAF35ujiwyudcUiX1+gWS4fiO9LZtBrxq2cTbdZNGxLdfwQ7uV5g==",
            )
            .cell(
              "te6ccsEBAQEAJAAAAEOAFCyYWNtTp3aw84nTIdXjpji+YMz/7pdk7+oJ6jAzL2LQaiqkuA==",
            );
        }

        if (
          toAddress(address).toString() ===
            "EQC783RxYZXOuKRL6_QLJcPxHels2g141bOJtusmjYluv5Kt" &&
          method === "get_wallet_data"
        ) {
          return createProviderSnapshot()
            .number("280398565")
            .cell(
              "te6ccsEBAQEAJAAAAEOAFAVgoKsPCVkoowC8NqfRJitCBaLlTyq5ip9YYuDXVM1wneLmIw==",
            )
            .cell(
              "te6ccsEBAQEAJAAAAEOAHayOdaqs0/6oQp1XNGWeaWmNiaWbRBeVziozKYjAzghwrsu0tg==",
            )
            .cell(
              "te6ccsECDwEAAxUAAAAADQASABcAdQB6AH8A/QFVAVoB2gIUAlQCwgMFART/APSkE/S88sgLAQIBYgIOAgLMAwQAt9kGOASS+CcADoaYGAuNhKia+B+AZwfSB9IBj9ABi465D9ABj9ABgBaY+QwQgHxT9S3UqYmiz4BPAQwQgLxqKM3UsYoiIB+AVwGsEILK+D3l1JrPgF8C+CQgf5eEAgEgBQ0CASAGCAH1UD0z/6APpAcCKAVQH6RDBYuvL07UTQ+gD6QPpA1DBRNqFSKscF8uLBKML/8uLCVDRCcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMkg+QBwdMjLAsoHy//J0AT6QPQEMfoAINdJwgDy4sR3gBjIywVQCM8WcIBwCs+gIXy2sTzIIQF41FGcjLHxnLP1AH+gIizxZQBs8WJfoCUAPPFslQBcwjkXKRceJQCKgToIIJycOAoBS88uLFBMmAQPsAECPIUAT6AljPFgHPFszJ7VQCASAJDAL3O1E0PoA+kD6QNQwCNM/+gBRUaAF+kD6QFNbxwVUc21wVCATVBQDyFAE+gJYzxYBzxbMySLIywES9AD0AMsAyfkAcHTIywLKB8v/ydBQDccFHLHy4sMK+gBRqKGCCJiWgGa2CKGCCJiWgKAYoSeXEEkQODdfBOMNJdcLAYAoLAHBSeaAYoYIQc2LQnMjLH1Iwyz9Y+gJQB88WUAfPFslxgBjIywUkzxZQBvoCFctqFMzJcfsAECQQIwB8wwAjwgCwjiGCENUydttwgBDIywVQCM8WUAT6AhbLahLLHxLLP8ly+wCTNWwh4gPIUAT6AljPFgHPFszJ7VQA1ztRND6APpA+kDUMAfTP/oA+kAwUVGhUknHBfLiwSfC//LiwgWCCTEtAKAWvPLiw4IQe92X3sjLHxXLP1AD+gIizxYBzxbJcYAYyMsFJM8WcPoCy2rMyYBA+wBAE8hQBPoCWM8WAc8WzMntVIACB1AEGuQ9qJofQB9IH0gahgCaY+QwQgLxqKM3QFBCD3uy+9dCVj5cWLpn5j9ABgJ0CgR5CgCfQEsZ4sA54tmZPaqQAG6D2BdqJofQB9IH0gahhq3vDTA==",
            );
        }

        throw new Error(`Unexpected call: ${address} ${method}`);
      });

      const contract = provider.open(
        FarmNftMinterV1.create(FARM_MINTER_ADDRESS),
      );

      const address = await contract.getStakingJettonAddress();

      expect(address).toMatchInlineSnapshot(
        '"EQDtZHOtVWaf9UIU6rmjLPNLTGxNLNogvK5xUZlMRgZwQ4Gt"',
      );
    });
  });
});
