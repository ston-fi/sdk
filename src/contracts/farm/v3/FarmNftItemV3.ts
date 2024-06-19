import {
  type Cell,
  type ContractProvider,
  type Sender,
  type SenderArguments,
  Dictionary,
  beginCell,
  toNano,
} from "@ton/ton";

import { Contract, type ContractOptions } from "@/contracts/core/Contract";
import type { AddressType, QueryIdType } from "@/types";
import { createSbtDestroyMessage } from "@/utils/createSbtDestroyMessage";

import { FARM_OP_CODES, FARM_VERSION } from "../constants";

import { FarmNftMinterV3 } from "./FarmNftMinterV3";

export interface FarmNftItemV3Options extends ContractOptions {
  gasConstants?: Partial<typeof FarmNftItemV3.gasConstants>;
}

export class FarmNftItemV3 extends Contract {
  public static readonly version = FARM_VERSION.v3;

  public static readonly gasConstants = {
    claimRewardsBase: toNano("0.35"),
    claimRewardsPerPool: toNano("0.13"),
    unstakeBase: toNano("0.45"),
    unstakePerPool: toNano("0.13"),
    destroy: toNano("0.05"),
  };

  public readonly gasConstants;

  constructor(
    address: AddressType,
    { gasConstants, ...options }: FarmNftItemV3Options = {},
  ) {
    super(address, options);

    this.gasConstants = {
      ...FarmNftItemV3.gasConstants,
      ...gasConstants,
    };
  }

  public async createClaimRewardsBody(
    params: {
      queryId?: QueryIdType;
    } & (
      | {
          claimAll: true;
        }
      | {
          claimAll: false;
          poolIndex: number;
        }
    ),
  ): Promise<Cell> {
    const builder = beginCell();

    builder.storeUint(FARM_OP_CODES.CLAIM_REWARDS, 32);
    builder.storeUint(params.queryId ?? 0, 64);

    if (params.claimAll) {
      builder.storeUint(1, 1);
      builder.storeUint(0, 8);
    } else {
      builder.storeUint(0, 1);
      builder.storeUint(params.poolIndex, 8);
    }

    return builder.endCell();
  }

  /**
   * Build all data required to execute a `claim_rewards` transaction.
   *
   * @param {number | undefined} params.poolCount - Optional; Number of deployed farm reward pools; If undefined value will get onchain
   * @param {number | undefined} params.poolIndex - Optional; farm reward pool index used for claiming; If undefined claim rewards from all pools
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   *
   * @returns {SenderArguments} all data required to execute a `claim_rewards` transaction.
   */
  public async getClaimRewardsTxParams(
    provider: ContractProvider,
    params?: {
      poolCount?: number;
      queryId?: QueryIdType;
      poolIndex?: number;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createClaimRewardsBody({
      queryId: params?.queryId,
      claimAll: params?.poolIndex === undefined,
      poolIndex: params?.poolIndex ?? 0,
    });

    const poolCount = params?.poolCount ?? (await this.getPoolCount(provider));

    const value =
      this.gasConstants.claimRewardsBase +
      this.gasConstants.claimRewardsPerPool * BigInt(poolCount - 1);

    return { to, value, body };
  }

  public async sendClaimRewards(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<FarmNftItemV3["getClaimRewardsTxParams"]>[1],
  ) {
    const txParams = await this.getClaimRewardsTxParams(provider, params);

    return via.send(txParams);
  }

  public async createUnstakeBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(FARM_OP_CODES.UNSTAKE, 32)
      .storeUint(params?.queryId ?? 0, 64)
      .endCell();
  }

  /**
   * Build all data required to execute a `unstake` transaction.
   *
   * @param {number | undefined} params.poolCount -  Optional; Number of deployed farm reward pools; If undefined value will get onchain
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   *
   * @returns {SenderArguments} all data required to execute a `unstake` transaction.
   */
  public async getUnstakeTxParams(
    provider: ContractProvider,
    params?: {
      poolCount?: number;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createUnstakeBody({
      queryId: params?.queryId,
    });

    const poolCount = params?.poolCount ?? (await this.getPoolCount(provider));

    const value =
      this.gasConstants.unstakeBase +
      this.gasConstants.unstakePerPool * BigInt(poolCount - 1);

    return { to, value, body };
  }

  public async sendUnstake(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<FarmNftItemV3["getUnstakeTxParams"]>[1],
  ) {
    const txParams = await this.getUnstakeTxParams(provider, params);

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
   * @param {bigint | string | number | undefined} params.queryId - Optional; query id
   *
   * @returns {SenderArguments} all data required to execute a `destroy` transaction.
   */
  public async getDestroyTxParams(
    provider: ContractProvider,
    params?: {
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createDestroyBody({
      queryId: params?.queryId,
    });

    const value = this.gasConstants.destroy;

    return { to, value, body };
  }

  public async sendDestroy(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<FarmNftItemV3["getDestroyTxParams"]>[1],
  ) {
    const txParams = await this.getDestroyTxParams(provider, params);

    return via.send(txParams);
  }

  /**
   * @returns structure containing current state of the farm NFT
   *
   * @property {number} status Status of the contract: uninitialized (0), active (1), unstaked (2), claiming (3), unstaked_pending (4)
   * @property {bigint} revokeTime Timestamp of unstake
   * @property {bigint} stakedTokens Amount of staked tokens
   * @property {bigint} stakeDate Timestamp in which the owner started staking
   * @property {Map<number, bigint>} claimedPerUnit `accrued_per_unit_nanorewards amounts` for each pool at the time of last claim for this user
   * @property {Address} ownerAddress Owner address of farm nft
   */
  public async getFarmingData(provider: ContractProvider) {
    const result = await provider.get("get_farming_data", []);

    return {
      status: result.stack.readNumber(),
      revokeTime: result.stack.readBigNumber(),
      stakedTokens: result.stack.readBigNumber(),
      stakeDate: result.stack.readBigNumber(),
      claimedPerUnit: (() => {
        const dict = result.stack
          .readCell()
          .asSlice()
          .loadDictDirect(
            Dictionary.Keys.Uint(8),
            Dictionary.Values.BigUint(150),
          );

        const claimedPerUnit = new Map<number, bigint>();

        for (const poolIndex of dict.keys()) {
          const accruedPerUnitNanorewards = dict.get(poolIndex);

          if (!accruedPerUnitNanorewards)
            throw new Error(
              `Failed to parse claimedPerUnit from dict: ${dict}`,
            );

          claimedPerUnit.set(Number(poolIndex), accruedPerUnitNanorewards);
        }

        return claimedPerUnit;
      })(),
      ownerAddress: result.stack.readAddress(),
    };
  }

  public async getPoolCount(provider: ContractProvider) {
    const result = await provider.get("get_nft_data", []);

    const nftItemData = {
      isInitialized: result.stack.readBoolean(),
      index: result.stack.readNumber(),
      minterAddress: result.stack.readAddress(),
    };

    const { poolCount } = await provider
      .open(FarmNftMinterV3.create(nftItemData.minterAddress))
      .getFarmingMinterData();

    return poolCount;
  }
}
