import TonWeb, { type NftItemOptions } from "tonweb";

import type {
  BN,
  Cell,
  QueryIdType,
  MessageData,
  SdkContractOptions,
  AmountType,
} from "@/types";
import { StonApiClient } from "@/StonApiClient";
import { parseBoolean } from "@/utils/parseBoolean";

import { FARM_OP_CODES, FARM_VERSION } from "../constants";

const {
  boc: { Cell },
  utils: { BN, Address },
  token: {
    nft: { NftItem },
  },
} = TonWeb;

export interface FarmNftItemV1Options
  extends SdkContractOptions,
    NftItemOptions {
  gasConstants?: Partial<typeof FarmNftItemV1.gasConstants>;
}

export class FarmNftItemV1 extends NftItem {
  public static readonly version: FARM_VERSION = FARM_VERSION.v1;

  public static readonly gasConstants = {
    claimRewards: new BN("300000000"),
    unstake: new BN("400000000"),
    destroy: new BN("50000000"),
  };

  protected readonly stonApiClient;

  public readonly gasConstants;

  constructor({
    tonApiClient,
    stonApiClient,
    gasConstants,
    ...options
  }: FarmNftItemV1Options) {
    super(tonApiClient, options);

    this.stonApiClient = stonApiClient ?? new StonApiClient(tonApiClient);
    this.gasConstants = {
      ...FarmNftItemV1.gasConstants,
      ...gasConstants,
    };
  }

  public async createClaimRewardsBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    const message = new Cell();

    message.bits.writeUint(FARM_OP_CODES.CLAIM_REWARDS, 32);
    message.bits.writeUint(params?.queryId ?? 0, 64);

    return message;
  }

  /**
   * Build all data required to execute a `claim_rewards` transaction.
   *
   * @param {BN | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} all data required to execute a `claim_rewards` transaction.
   */
  public async buildClaimRewardsTxParams(params?: {
    gasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const to = await this.getAddress();

    const payload = await this.createClaimRewardsBody({
      queryId: params?.queryId,
    });

    const gasAmount = new BN(
      params?.gasAmount ?? this.gasConstants.claimRewards,
    );

    return {
      to: new Address(to.toString(true, true, true)),
      payload,
      gasAmount,
    };
  }

  public async createUnstakeBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    const message = new Cell();

    message.bits.writeUint(FARM_OP_CODES.UNSTAKE, 32);
    message.bits.writeUint(params?.queryId ?? 0, 64);

    return message;
  }

  /**
   * Build all data required to execute a `unstake` transaction.
   *
   * @param {BN | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} all data required to execute a `unstake` transaction.
   */
  public async buildUnstakeTxParams(params?: {
    gasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const to = await this.getAddress();

    const payload = await this.createUnstakeBody({
      queryId: params?.queryId,
    });

    const gasAmount = new BN(params?.gasAmount ?? this.gasConstants.unstake);

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
   * @property {boolean} isSoulbound If nft is soulbound
   * @property {BN} stakedTokens Amount of staked tokens
   * @property {BN} claimedPerUnitNanorewards `accrued_per_unit_nanorewards` at the time the user made the stake or last claimed rewards
   */
  public async getFarmingData() {
    const contractAddress = await this.getAddress();

    const result = await this.provider.call2(
      contractAddress.toString(),
      "get_farming_data",
    );

    return {
      status: (result[0] as BN).toNumber(),
      isSoulbound: parseBoolean(result[1]),
      stakedTokens: result[2] as BN,
      claimedPerUnitNanorewards: result[3] as BN,
    };
  }
}
