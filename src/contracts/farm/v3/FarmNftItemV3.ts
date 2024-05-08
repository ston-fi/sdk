import TonWeb, { type NftItemOptions } from "tonweb";

import type {
  BN,
  Cell,
  QueryIdType,
  MessageData,
  SdkContractOptions,
} from "@/types";
import { StonApiClient } from "@/StonApiClient";
import { createSbtDestroyMessage } from "@/utils/createSbtDestroyMessage";
import { parseAddressNotNull } from "@/utils/parseAddress";
import { parseDictionaryUint } from "@/utils/parseDictionary";

import { FARM_OP_CODES, FARM_VERSION } from "../constants";
import { FarmNftMinterV3 } from "./FarmNftMinterV3";

const {
  boc: { Cell },
  utils: { BN, Address },
  token: {
    nft: { NftItem },
  },
} = TonWeb;

export interface FarmNftItemV3Options
  extends SdkContractOptions,
    NftItemOptions {
  address: Required<NftItemOptions>["address"];
  gasConstants?: Partial<typeof FarmNftItemV3.gasConstants>;
}

export class FarmNftItemV3 extends NftItem {
  public static readonly version = FARM_VERSION.v3;

  public static readonly gasConstants = {
    claimRewardsBase: new BN("350000000"),
    claimRewardsPerPool: new BN("130000000"),
    unstakeBase: new BN("450000000"),
    unstakePerPool: new BN("130000000"),
    destroy: new BN("50000000"),
  };

  protected readonly stonApiClient;

  public readonly gasConstants;

  constructor({
    tonApiClient,
    stonApiClient,
    gasConstants,
    ...options
  }: FarmNftItemV3Options) {
    super(tonApiClient, options);

    this.stonApiClient = stonApiClient ?? new StonApiClient(tonApiClient);
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
    const message = new Cell();

    message.bits.writeUint(FARM_OP_CODES.CLAIM_REWARDS, 32);
    message.bits.writeUint(params.queryId ?? 0, 64);

    if (params.claimAll) {
      message.bits.writeUint(1, 1);
      message.bits.writeUint(0, 8);
    } else {
      message.bits.writeUint(0, 1);
      message.bits.writeUint(params.poolIndex, 8);
    }

    return message;
  }

  /**
   * Build all data required to execute a `claim_rewards` transaction.
   *
   * @param {number | undefined} params.poolCount - Optional; Number of deployed farm reward pools; If undefined value will get onchain
   * @param {number | undefined} params.poolIndex - Optional; farm reward pool index used for claiming; If undefined claim rewards from all pools
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} all data required to execute a `claim_rewards` transaction.
   */
  public async buildClaimRewardsTxParams(params: {
    poolCount?: number;
    queryId?: QueryIdType;
    poolIndex?: number;
  }): Promise<MessageData> {
    const to = await this.getAddress();

    const payload = await this.createClaimRewardsBody({
      queryId: params.queryId,
      claimAll: params.poolIndex === undefined,
      poolIndex: params.poolIndex ?? 0,
    });

    const poolCount = params.poolCount ?? (await this.getPoolCount());

    const gasAmount = this.gasConstants.claimRewardsBase.add(
      this.gasConstants.claimRewardsPerPool.muln(poolCount - 1),
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
   * @param {number | undefined} params.poolCount -  Optional; Number of deployed farm reward pools; If undefined value will get onchain
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} all data required to execute a `unstake` transaction.
   */
  public async buildUnstakeTxParams(params: {
    poolCount?: number;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const to = await this.getAddress();

    const payload = await this.createUnstakeBody({
      queryId: params.queryId,
    });

    const poolCount = params.poolCount ?? (await this.getPoolCount());

    const gasAmount = this.gasConstants.unstakeBase.add(
      this.gasConstants.unstakePerPool.muln(poolCount - 1),
    );

    return {
      to: new Address(to.toString(true, true, true)),
      payload,
      gasAmount,
    };
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
   * @param {BN | string | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} all data required to execute a `destroy` transaction.
   */
  public async buildDestroyTxParams(params?: {
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const to = await this.getAddress();

    const payload = await this.createDestroyBody({
      queryId: params?.queryId,
    });

    const gasAmount = this.gasConstants.destroy;

    return {
      to: new Address(to.toString(true, true, true)),
      payload,
      gasAmount,
    };
  }

  /**
   * @returns structure containing current state of the farm NFT
   *
   * @property {number} status Status of the contract: uninitialized (0), active (1), unstaked (2), claiming (3), unstaked_pending (4)
   * @property {BN} revokeTime Timestamp of unstake
   * @property {BN} stakedTokens Amount of staked tokens
   * @property {BN} stakeDate Timestamp in which the owner started staking
   * @property {Map<number, BN>} claimedPerUnit `accrued_per_unit_nanorewards amounts` for each pool at the time of last claim for this user
   * @property {Address} ownerAddress Owner address of farm nft
   */
  public async getFarmingData() {
    const contractAddress = await this.getAddress();

    const result = await this.provider.call2(
      contractAddress.toString(),
      "get_farming_data",
    );

    const claimedPerUnitDict = parseDictionaryUint(result[4] as Cell, 8, 150);
    const claimedPerUnit = new Map<number, BN>();

    claimedPerUnitDict.forEach((accruedPerUnitNanorewards, poolIndex) => {
      claimedPerUnit.set(Number(poolIndex), accruedPerUnitNanorewards);
    });

    return {
      status: (result[0] as BN).toNumber(),
      revokeTime: result[1] as BN,
      stakedTokens: result[2] as BN,
      stakeDate: result[3] as BN,
      claimedPerUnit,
      ownerAddress: parseAddressNotNull(result[5]),
    };
  }

  public async getPoolCount() {
    const { collectionAddress: minterAddress } = await this.getData();

    const minter = new FarmNftMinterV3({
      tonApiClient: this.provider,
      stonApiClient: this.stonApiClient,
      address: minterAddress,
    });

    const { poolCount } = await minter.getData();

    return poolCount;
  }
}
