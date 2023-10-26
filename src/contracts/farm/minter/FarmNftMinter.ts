import TonWeb from 'tonweb';

import type {
  Address,
  Cell,
  HttpProvider,
  BN,
  AddressType,
  QueryIdType,
  MessageData,
  AmountType,
  NftCollectionOptions,
} from '@/types';
import { FARM_REVISION } from '../constants';
import { createJettonTransferMessage } from '@/utils/createJettonTransferMessage';

import type { FarmNftMinterRevision } from './FarmNftMinterRevision';
import { FarmNftMinterRevisionV2 } from './FarmNftMinterRevisionV2';

const {
  Address,
  utils: { BN },
  token: {
    nft: { NftCollection },
    jetton: { JettonMinter, JettonWallet },
  },
} = TonWeb;

const REVISIONS = {
  [FARM_REVISION.V2]: FarmNftMinterRevisionV2,
} as const;

export type FarmNftMinterGasConstants = {
  stake: BN;
  stakeForward: BN;
};

/**
 * @typedef {Object} FarmNftMinterData
 *
 * @property {BN} nextItemIndex - Index of the next nft in this collection
 * @property {BN} lastUpdateTime - Last time farming values were updated
 * @property {number} status - Status of the contract: uninitialized `0`, active `1`, paused `3`
 * @property {BN} depositedNanorewards - Deposited rewards in nanounits
 * @property {BN} currentStakedTokens - Number of staked tokens in basic token units
 * @property {BN} accruedPerUnitNanorewards - Number of accrued nanorewards per basic stake token unit
 * @property {BN} claimedFeeNanorewards - Claimed fees @since V2 revision
 * @property {BN} accruedFeeNanorewards - Accrued fees @since V2 revision
 * @property {BN} accruedNanorewards - Total number of accrued rewards in nanounits
 * @property {BN} claimedNanorewards - Number of claimed rewards in nanounits
 * @property {BN} contractUniqueId - Minter id
 * @property {BN} nanorewardsPer24h - Total number of accrued rewards per 24h in nanounits
 * @property {BN} adminFee - Admin fee; divider is 10000 @since V2 revision
 * @property {Boolean} soulboundItems - Whether minted NFTs are soulbound
 * @property {BN} minStakeTime - Minimum staking time
 * @property {Address} stakingTokenWallet - Minter's staking jetton wallet
 * @property {Address} rewardTokenWallet - Minter's reward jetton wallet
 * @property {Address} custodianAddress - Custodian address @since V2 revision
 * @property {Boolean} canChangeCustodian - If can change custodian @since V2 revision
 * @property {Boolean} canSendRawMsg - If can send raw msg @since V2 revision
 * @property {Boolean} canChangeFee - If can change fee @since V2 revision
 * @property {Boolean} unrestrictedDepositRewards - If rewards can be deposited by anyone @since V2 revision
 */
export type FarmNftMinterData = {
  nextItemIndex: BN;
  lastUpdateTime: BN;
  status: number;
  depositedNanorewards: BN;
  currentStakedTokens: BN;
  accruedPerUnitNanorewards: BN;
  claimedFeeNanorewards: BN;
  accruedFeeNanorewards: BN;
  accruedNanorewards: BN;
  claimedNanorewards: BN;
  contractUniqueId: BN;
  nanorewardsPer24h: BN;
  adminFee: BN;
  soulboundItems: Boolean;
  minStakeTime: BN;
  stakingTokenWallet: Address;
  rewardTokenWallet: Address;
  custodianAddress: Address | null;
  canChangeCustodian: Boolean;
  canSendRawMsg: Boolean;
  canChangeFee: Boolean;
  unrestrictedDepositRewards: Boolean;
};

/**
 * @since V2 revision
 * @typedef {Object} PendingData
 *
 * @property {BN} changeCustodianTs - Timestamp when 'change_custodian' was initiated
 * @property {BN} sendMsgTs - Timestamp when 'send_raw_msg' was initiated
 * @property {BN} codeUpgradeTs - Timestamp when 'code_upgrade' was initiated
 * @property {Address} newCustodian - New custodian that will be set after confirmation
 * @property {Cell} pendingMsg - Pending msg that will be sends after confirmation
 * @property {Cell} newCode - New contract code that will be set after confirmation
 * @property {Cell} newStorage - New contract storage that will be set after confirmation
 */
export type PendingData = {
  changeCustodianTs: BN;
  sendMsgTs: BN;
  codeUpgradeTs: BN;
  newCustodian: Address | null;
  pendingMsg: Cell;
  newCode: Cell;
  newStorage: Cell;
};

/**
 * @since V2 revision
 * @typedef {Object} Version
 *
 * @property {number} major - Major version; breaking changes in api
 * @property {number} minor - Minor version; non-breaking new functionality
 * @property {string} development - Development version; can contain breaking changes
 */
export type Version = {
  major: number;
  minor: number;
  development: string;
};

interface FarmNftMinterOptions extends NftCollectionOptions {
  revision: FarmNftMinterRevision | keyof typeof REVISIONS;
  address: AddressType;
}

export class FarmNftMinter extends NftCollection {
  private revision: FarmNftMinterRevision;

  constructor(
    provider: HttpProvider,
    { revision, ...options }: FarmNftMinterOptions,
  ) {
    super(provider, options);

    if (typeof revision === 'string') {
      if (!REVISIONS[revision])
        throw Error(`Unknown pool revision: ${revision}`);

      this.revision = new REVISIONS[revision]();
    } else {
      this.revision = revision;
    }
  }

  public get gasConstants(): FarmNftMinterGasConstants {
    return this.revision.gasConstants;
  }

  /**
   * Create a payload for the `stake` transaction.
   *
   * @returns payload for the `stake` transaction.
   */
  public async createStakeBody(): Promise<Cell> {
    return this.revision.createStakeBody(this);
  }

  /**
   * @returns {Address} address of minter for staking jetton
   */
  public async getStakingJettonAddress(): Promise<Address> {
    const { stakingTokenWallet } = await this.getData();

    const jettonWallet = new JettonWallet(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: stakingTokenWallet,
      },
    );

    const { jettonMinterAddress } = await jettonWallet.getData();

    return jettonMinterAddress;
  }

  public async getPendingData(): Promise<PendingData> {
    return this.revision.getPendingData(this);
  }

  public async getVersion(): Promise<Version> {
    return this.revision.getVersion(this);
  }

  /**
   * @returns {FarmNftMinterData} containing current state of the minter
   */
  public async getData(): Promise<FarmNftMinterData> {
    return this.revision.getData(this);
  }

  /**
   * Build all data required to execute a jetton `stake` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.jettonAddress - Jetton address of token to be staked
   * @param {BN | number} params.jettonAmount - Amount of tokens to be staked (in basic token units)
   * @param {BN | number | undefined} params.gasAmount - Optional; amount of gas for the transaction (in nanoTons)
   * @param {BN | number | undefined} params.forwardGasAmount - Optional; forward amount of gas for the next transaction (in nanoTons)
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} containing all data required to execute a jetton `stake` transaction
   */
  public async buildStakeTxParams(params: {
    userWalletAddress: AddressType;
    jettonAddress: AddressType;
    jettonAmount: AmountType;
    gasAmount?: AmountType;
    forwardGasAmount?: AmountType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const jetton = new JettonMinter(
      this.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: params.jettonAddress,
      },
    );

    const jettonWalletAddress = await jetton.getJettonWalletAddress(
      new Address(params.userWalletAddress),
    );

    const forwardPayload = await this.createStakeBody();

    const forwardTonAmount = new BN(
      params.forwardGasAmount ?? this.gasConstants.stakeForward,
    );

    const payload = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.jettonAmount,
      destination: await this.getAddress(),
      responseDestination: params.userWalletAddress,
      forwardTonAmount,
      forwardPayload,
    });

    const gasAmount = new BN(params.gasAmount ?? this.gasConstants.stake);

    return {
      to: jettonWalletAddress,
      payload,
      gasAmount,
    };
  }
}
