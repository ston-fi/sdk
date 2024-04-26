import TonWeb from "tonweb";

import type { BN, Cell, QueryIdType, MessageData, AmountType } from "@/types";
import { createSbtDestroyMessage } from "@/utils";

import { FARM_VERSION } from "../constants";
import { FarmNftItemV1, type FarmNftItemV1Options } from "../v1/FarmNftItemV1";

const {
  boc: { Cell },
  utils: { BN, Address },
} = TonWeb;

export interface FarmNftItemV2Options extends FarmNftItemV1Options {}

export class FarmNftItemV2 extends FarmNftItemV1 {
  public static version = FARM_VERSION.v2;

  protected async createDestroyBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return createSbtDestroyMessage({
      queryId: params?.queryId ?? 0,
    });
  }

  /**
   * Build all data required to execute a `destroy` transaction.
   *
   * @param {BN | number | string | undefined} params.gasAmount - Optional; amount of gas for the transaction (in nanoTons)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} all data required to execute a `destroy` transaction.
   */
  public async buildDestroyTxParams(params?: {
    gasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const to = await this.getAddress();

    const payload = await this.createDestroyBody({ queryId: params?.queryId });

    const gasAmount = new BN(params?.gasAmount ?? this.gasConstants.destroy);

    return {
      to: new Address(to.toString(true, true, true)),
      payload,
      gasAmount,
    };
  }

  /**
   * @returns structure containing current state of the farm NFT
   *
   * @property {number} status Status of the contract: uninitialized `0`, active `1`, unstaked `2`, claiming `3`
   * @property {BN} revokeTime Timestamp of unstake
   * @property {BN} stakedTokens Amount of staked tokens
   * @property {BN} claimedPerUnitNanorewards `accrued_per_unit_nanorewards` at the time the user made the stake or last claimed rewards
   * @property {BN} stakeDate Timestamp in which the owner started staking
   * @property {boolean} isSoulbound If nft is soulbound; Always true in V2
   */
  public override async getFarmingData() {
    const contractAddress = await this.getAddress();

    const result = await this.provider.call2(
      contractAddress.toString(),
      "get_farming_data",
    );

    return {
      status: (result[0] as BN).toNumber(),
      revokeTime: result[1] as BN,
      stakedTokens: result[2] as BN,
      claimedPerUnitNanorewards: result[3] as BN,
      stakeDate: result[4] as BN,
      isSoulbound: true, // NFTs are always soulbound in V2
    };
  }
}
