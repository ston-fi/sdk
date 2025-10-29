import {
  beginCell,
  type Cell,
  type ContractProvider,
  type Sender,
  type SenderArguments,
  toNano,
} from "@ton/ton";

import type { AddressType, AmountType, QueryIdType } from "../../../types";
import { Contract, type ContractOptions } from "../../core/Contract";
import { FARM_OP_CODES, FARM_VERSION } from "../constants";

export interface FarmNftItemV1Options extends ContractOptions {
  gasConstants?: Partial<typeof FarmNftItemV1.gasConstants>;
}

/**
 * @deprecated `v1` version of the FarmNftItem contracts is deprecated.
 *
 * Only use this version to claim rewards and unstake tokens from the contract.
 * For all other operations, use the latest version of the contract.
 */
export class FarmNftItemV1 extends Contract {
  public static readonly version: FARM_VERSION = FARM_VERSION.v1;

  public static readonly gasConstants = {
    claimRewards: toNano("0.3"),
    unstake: toNano("0.4"),
    destroy: toNano("0.05"),
  };

  public readonly gasConstants;

  constructor(
    address: AddressType,
    { gasConstants, ...options }: FarmNftItemV1Options = {},
  ) {
    super(address, options);

    this.gasConstants = {
      ...FarmNftItemV1.gasConstants,
      ...gasConstants,
    };
  }

  public async createClaimRewardsBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(FARM_OP_CODES.CLAIM_REWARDS, 32)
      .storeUint(BigInt(params?.queryId ?? 0), 64)
      .endCell();
  }

  /**
   * Build all data required to execute a `claim_rewards` transaction.
   *
   * @param {bigint | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   *
   * @returns {SenderArguments} all data required to execute a `claim_rewards` transaction.
   */
  public async getClaimRewardsTxParams(
    provider: ContractProvider,
    params?: {
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createClaimRewardsBody({
      queryId: params?.queryId,
    });

    const value = BigInt(params?.gasAmount ?? this.gasConstants.claimRewards);

    return { to, value, body };
  }

  public async sendClaimRewards(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<FarmNftItemV1["getClaimRewardsTxParams"]>[1],
  ) {
    const txParams = await this.getClaimRewardsTxParams(provider, params);

    return via.send(txParams);
  }

  public async createUnstakeBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(FARM_OP_CODES.UNSTAKE, 32)
      .storeUint(BigInt(params?.queryId ?? 0), 64)
      .endCell();
  }

  /**
   * Build all data required to execute a `unstake` transaction.
   *
   * @param {bigint | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   *
   * @returns {SenderArguments} all data required to execute a `unstake` transaction.
   */
  public async getUnstakeTxParams(
    provider: ContractProvider,
    params?: {
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createUnstakeBody({
      queryId: params?.queryId,
    });

    const value = BigInt(params?.gasAmount ?? this.gasConstants.unstake);

    return { to, value, body };
  }

  public async sendUnstake(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<FarmNftItemV1["getUnstakeTxParams"]>[1],
  ) {
    const txParams = await this.getUnstakeTxParams(provider, params);

    return via.send(txParams);
  }

  /**
   * @returns structure containing current state of the farm NFT
   *
   * @property {number} status Status of the contract: uninitialized `0`, active `1`, unstaked `2`, claiming `3`
   * @property {boolean} isSoulbound If nft is soulbound
   * @property {bigint} stakedTokens Amount of staked tokens
   * @property {bigint} claimedPerUnitNanorewards `accrued_per_unit_nanorewards` at the time the user made the stake or last claimed rewards
   */
  public async getFarmingData(provider: ContractProvider) {
    const result = await provider.get("get_farming_data", []);

    return {
      status: result.stack.readNumber(),
      isSoulbound: result.stack.readBoolean(),
      stakedTokens: result.stack.readBigNumber(),
      claimedPerUnitNanorewards: result.stack.readBigNumber(),
    };
  }
}
