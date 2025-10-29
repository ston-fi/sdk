import {
  beginCell,
  type Cell,
  type ContractProvider,
  type Sender,
  type SenderArguments,
  toNano,
} from "@ton/ton";

import {
  Contract,
  type ContractOptions,
} from "../../sdk/src/contracts/core/Contract";
import type { AddressType, AmountType, QueryIdType } from "../../sdk/src/types";
import { createSbtDestroyMessage } from "../../sdk/src/utils/createSbtDestroyMessage";

import { STAKE_OP_CODES } from "./constants";

export const StakeNftItemStatus = {
  UNINITIALIZED: 0,
  ACTIVE: 1,
  UNSTAKED: 2,
  CLAIMING: 3,
} as const;

export type StakeNftItemStatus =
  (typeof StakeNftItemStatus)[keyof typeof StakeNftItemStatus];

export interface StakeNftItemOptions extends ContractOptions {
  gasConstants?: Partial<typeof StakeNftItem.gasConstants>;
}

export class StakeNftItem extends Contract {
  public static readonly gasConstants = {
    unstake: toNano("0.3"),
    restake: toNano("0.4"),
    claimRewards: toNano("0.3"),
    destroy: toNano("0.05"),
  };

  public readonly gasConstants;

  constructor(
    address: AddressType,
    { gasConstants, ...options }: StakeNftItemOptions = {},
  ) {
    super(address, options);

    this.gasConstants = {
      ...StakeNftItem.gasConstants,
      ...gasConstants,
    };
  }

  public async createUnstakeBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(STAKE_OP_CODES.UNSTAKE, 32)
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
    params: Parameters<StakeNftItem["getUnstakeTxParams"]>[1],
  ) {
    const txParams = await this.getUnstakeTxParams(provider, params);

    return via.send(txParams);
  }

  public async createRestakeBody(params?: {
    queryId?: QueryIdType;
    durationSeconds?: bigint | number;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(STAKE_OP_CODES.RESTAKE, 32)
      .storeUint(BigInt(params?.queryId ?? 0), 64)
      .storeUint(BigInt(params?.durationSeconds ?? 0), 64)
      .endCell();
  }

  public async sendRestake(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<StakeNftItem["getRestakeTxParams"]>[1],
  ) {
    const txParams = await this.getRestakeTxParams(provider, params);

    return via.send(txParams);
  }

  /**
   * Build all data required to execute a `restake` transaction.
   *
   * @param {bigint | number | undefined} params.durationSeconds - Duration of the stake in seconds
   * @param {bigint | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   *
   * @returns {SenderArguments} all data required to execute a `restake` transaction.
   */
  public async getRestakeTxParams(
    provider: ContractProvider,
    params?: {
      durationSeconds?: bigint | number;
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createRestakeBody({
      durationSeconds: params?.durationSeconds,
      queryId: params?.queryId,
    });

    const value = BigInt(params?.gasAmount ?? this.gasConstants.restake);

    return { to, value, body };
  }

  public async createClaimRewardsBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(STAKE_OP_CODES.CLAIM_REWARDS, 32)
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
    params: Parameters<StakeNftItem["getClaimRewardsTxParams"]>[1],
  ) {
    const txParams = await this.getClaimRewardsTxParams(provider, params);

    return via.send(txParams);
  }

  public async createDestroyBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return createSbtDestroyMessage({
      queryId: params?.queryId ?? 0,
    });
  }

  /**
   * Build all data required to execute a `destroy` transaction.
   *
   * @param {bigint | number | string | undefined} params.gasAmount - Optional; amount of gas for the transaction (in nanoTons)
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   *
   * @returns {SenderArguments} all data required to execute a `destroy` transaction.
   */
  public async getDestroyTxParams(
    provider: ContractProvider,
    params?: {
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createDestroyBody({
      queryId: params?.queryId,
    });

    const value = BigInt(params?.gasAmount ?? this.gasConstants.destroy);

    return { to, value, body };
  }

  /**
   * @returns structure containing current state of the stake NFT
   *
   * @property {number} status                           Status of the contract: `uninitialized` (0), `active` (1), `unstaked` (2), `claiming` (3)
   * @property {bigint} claimed_per_vote_fractionrewards `accrued_per_vote_fractionrewards` at the time the user made the stake or last claimed rewards
   * @property {bigint} vote_power                       Voting power
   * @property {bigint} min_unstake_date                 Timestamp of the earliest unstake date
   * @property {bigint} lock_date                        Timestamp of the lock date
   * @property {bigint} staked_tokens                    Amount of staked tokens on this nft
   * @property {Address} owner_address                   Nft owner address; `null_address` if destroyed
   * @property {bigint} secondary_tokens_minted          Total amount of `GEMSTON` minted for this nft
   * @property {bigint} revoke_time                      Timestamp of the unstake operation (`0` if not unstaked)
   */
  public async getStakingData(provider: ContractProvider) {
    const result = await provider.get("get_staking_data", []);

    return {
      status: result.stack.readNumber() as StakeNftItemStatus,
      claimed_per_vote_fractionrewards: result.stack.readBigNumber(),
      vote_power: result.stack.readBigNumber(),
      min_unstake_date: result.stack.readBigNumber(),
      lock_date: result.stack.readBigNumber(),
      staked_tokens: result.stack.readBigNumber(),
      owner_address: result.stack.readAddress(),
      secondary_tokens_minted: result.stack.readBigNumber(),
      revoke_time: result.stack.readBigNumber(),
    };
  }
}
