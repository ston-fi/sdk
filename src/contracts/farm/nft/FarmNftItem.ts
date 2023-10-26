import TonWeb from 'tonweb';

import type {
  Cell,
  HttpProvider,
  BN,
  AddressType,
  QueryIdType,
  MessageData,
  AmountType,
  NftItemOptions,
} from '@/types';
import { FARM_REVISION } from '../constants';

import { FarmNftItemRevision } from './FarmNftItemRevision';
import { FarmNftItemRevisionV2 } from './FarmNftItemRevisionV2';

const {
  utils: { BN },
  token: {
    nft: { NftItem },
  },
} = TonWeb;

const REVISIONS = {
  [FARM_REVISION.V2]: FarmNftItemRevisionV2,
} as const;

export type FarmNftItemGasConstants = {
  claimRewards: BN;
  unstake: BN;
  destroy: BN;
};

/**
 * @type {FarmNftItemFarmingData} represent state of the farm NFT
 *
 * @property {number} status Status of the contract: uninitialized `0`, active `1`, unstaked `2`, claiming `3`
 * @property {boolean} isSoulbound If nft is soulbound
 * @property {BN} revokeTime Timestamp of unstake @since V2 revision
 * @property {BN} stakedTokens Amount of staked tokens
 * @property {BN} claimedPerUnitNanorewards `accrued_per_unit_nanorewards` at the time the user made the stake or last claimed rewards
 * @property {BN} stakeDate Timestamp in which the owner started staking
 */
export type FarmNftItemFarmingData = {
  status: number;
  isSoulbound: boolean;
  revokeTime: BN;
  stakedTokens: BN;
  claimedPerUnitNanorewards: BN;
  stakeDate: BN;
};

interface FarmNftItemOptions extends NftItemOptions {
  revision: FarmNftItemRevision | keyof typeof REVISIONS;
  address: AddressType;
}

export class FarmNftItem extends NftItem {
  private revision: FarmNftItemRevision;

  constructor(
    provider: HttpProvider,
    { revision, ...options }: FarmNftItemOptions,
  ) {
    super(provider, options);

    if (typeof revision === 'string') {
      if (!REVISIONS[revision])
        throw Error(`Unknown farm NFT item revision: ${revision}`);

      this.revision = new REVISIONS[revision]();
    } else {
      this.revision = revision;
    }
  }

  public get gasConstants(): FarmNftItemGasConstants {
    return this.revision.gasConstants;
  }

  /**
   * Creates payload for the `claim_rewards` transaction.
   *
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {Cell} payload for the `claim_rewards` transaction.
   */
  public async createClaimRewardsBody(params: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return this.revision.createClaimRewardsBody(this, params);
  }

  /**
   * Creates payload for the `destroy` transaction.
   *
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {Cell} payload for the `destroy` transaction.
   */
  public async createDestroyBody(params: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return this.revision.createDestroyBody(this, params);
  }

  /**
   * Creates payload for the `unstake` transaction.
   *
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {Cell} payload for the `unstake` transaction.
   */
  public async createUnstakeBody(params: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return this.revision.createUnstakeBody(this, params);
  }

  /**
   * @returns {FarmNftItemFarmingData} structure containing current state of the farm NFT
   */
  public async getFarmingData(): Promise<FarmNftItemFarmingData> {
    return await this.revision.getFarmingData(this);
  }

  /**
   * Build all data required to execute a `claim_rewards` transaction.
   *
   * @param {BN | number | undefined} params.gasAmount - Optional; amount of gas for the transaction (in nanoTons)
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

    return { to, payload, gasAmount };
  }

  /**
   * Build all data required to execute a `unstake` transaction.
   *
   * @param {BN | number | undefined} params.gasAmount - Optional; amount of gas for the transaction (in nanoTons)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} all data required to execute a `unstake` transaction.
   */
  public async buildUnstakeTxParams(params?: {
    gasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const to = await this.getAddress();

    const payload = await this.createUnstakeBody({ queryId: params?.queryId });

    const gasAmount = new BN(params?.gasAmount ?? this.gasConstants.unstake);

    return { to, payload, gasAmount };
  }

  /**
   * Build all data required to execute a `destroy` transaction.
   *
   * @param {BN | number | undefined} params.gasAmount - Optional; amount of gas for the transaction (in nanoTons)
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
      to,
      payload,
      gasAmount,
    };
  }
}
