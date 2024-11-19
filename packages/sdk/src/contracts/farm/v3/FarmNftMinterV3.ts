import {
  type Address,
  type Cell,
  type ContractProvider,
  Dictionary,
  type Sender,
  type SenderArguments,
  beginCell,
  toNano,
} from "@ton/ton";

import type { AddressType, AmountType, QueryIdType } from "../../../types";
import { createJettonTransferMessage } from "../../../utils/createJettonTransferMessage";
import { toAddress } from "../../../utils/toAddress";
import { Contract, type ContractOptions } from "../../core/Contract";
import { JettonMinter } from "../../core/JettonMinter";
import { JettonWallet } from "../../core/JettonWallet";
import { FARM_OP_CODES, FARM_VERSION } from "../constants";

/**
 *  @type {FarmDataAccrued} represent state of the accrued data for pool
 *
 * @property {bigint} depositedNanorewards - Deposited rewards in nanounits
 * @property {bigint} accruedPerUnitNanorewards - Number of accrued nanorewards per basic stake token unit
 * @property {bigint} accruedFeeNanorewards - Accrued fees
 * @property {bigint} claimedNanorewards - Number of claimed rewards in nanounits
 * @property {bigint} claimedFeeNanorewards - Claimed fees
 * @property {bigint} accruedNanorewards - Total number of accrued rewards in nanounits
 * @property {bigint} lastUpdateTime - Last time farming values were updated
 */
export type FarmDataAccrued = {
  depositedNanorewards: bigint;
  accruedPerUnitNanorewards: bigint;
  accruedFeeNanorewards: bigint;
  claimedNanorewards: bigint;
  claimedFeeNanorewards: bigint;
  accruedNanorewards: bigint;
  lastUpdateTime: bigint;
};

/**
 *  @type {FarmDataParameters} represent state of the pool parameters
 *
 * @property {bigint} adminFee - Admin fee; divider is 10000
 * @property {bigint} nanorewardsPer24h - Total number of accrued rewards per 24h in nanounits
 * @property {boolean} unrestrictedDepositRewards - If rewards can be deposited by anyone
 * @property {Address} rewardTokenWallet - Minter's reward jetton wallet
 * @property {boolean} canChangeFee - If can change fee
 * @property {bigint} status - Status of the contract
 */
export type FarmDataParameters = {
  adminFee: bigint;
  nanorewardsPer24h: bigint;
  unrestrictedDepositRewards: boolean;
  rewardTokenWallet: Address;
  canChangeFee: boolean;
  status: number;
};

export interface FarmNftMinterV3Options extends ContractOptions {
  gasConstants?: Partial<typeof FarmNftMinterV3.gasConstants>;
}

export class FarmNftMinterV3 extends Contract {
  public static readonly version: FARM_VERSION = FARM_VERSION.v3;

  public static readonly gasConstants = {
    stakeFwdBase: toNano("0.21"),
    stakeFwdPerPool: toNano("0.015"),
    stake: toNano("0.1"),
  };

  public readonly gasConstants;

  constructor(
    address: AddressType,
    { gasConstants, ...options }: FarmNftMinterV3Options = {},
  ) {
    super(address, options);

    this.gasConstants = {
      ...FarmNftMinterV3.gasConstants,
      ...gasConstants,
    };
  }

  public async createStakeBody(params?: {
    ownerAddress?: AddressType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(FARM_OP_CODES.STAKE, 32)
      .storeAddress(
        params?.ownerAddress ? toAddress(params.ownerAddress) : undefined,
      )
      .endCell();
  }

  /**
   * Build all data required to execute a jetton `stake` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.jettonAddress - Jetton address of token to be staked
   * @param {bigint | number} params.jettonAmount - Amount of tokens to be staked (in basic token units)
   * @param {number | undefined} params.poolCount - Optional; Number of deployed farm reward pools; If undefined value will get onchain
   * @param {Address | string} params.ownerAddress - Optional; custom owner of stake; if undefined stake owner is sender address
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   *
   * @returns {SenderArguments} containing all data required to execute a jetton `stake` transaction
   */
  public async getStakeTxParams(
    provider: ContractProvider,
    params: {
      userWalletAddress: AddressType;
      jettonAddress: AddressType;
      jettonAmount: AmountType;
      poolCount?: number;
      ownerAddress?: AddressType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const [jettonWalletAddress, forwardPayload, poolCount] = await Promise.all([
      provider
        .open(JettonMinter.create(params.jettonAddress))
        .getWalletAddress(params.userWalletAddress),
      this.createStakeBody({
        ownerAddress: params.ownerAddress,
      }),
      (async () =>
        params.poolCount ??
        (await this.getFarmingMinterData(provider)).poolCount)(),
    ]);

    const forwardTonAmount =
      this.gasConstants.stakeFwdBase +
      this.gasConstants.stakeFwdPerPool * BigInt(poolCount + 1);

    const body = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.jettonAmount,
      destination: this.address,
      responseDestination: params.userWalletAddress,
      forwardTonAmount,
      forwardPayload,
    });

    const value = forwardTonAmount + this.gasConstants.stake;

    return {
      to: jettonWalletAddress,
      value,
      body,
    };
  }

  public async sendStake(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<FarmNftMinterV3["getStakeTxParams"]>[1],
  ) {
    const txParams = await this.getStakeTxParams(provider, params);

    return via.send(txParams);
  }

  /**
   * @returns {Address} address of minter for staking jetton that is used for farming
   */
  public async getStakingJettonAddress(
    provider: ContractProvider,
  ): Promise<Address> {
    const { stakingTokenWallet: stakingTokenWalletAddress } =
      await this.getFarmingMinterData(provider);

    const { jettonMasterAddress } = await provider
      .open(JettonWallet.create(stakingTokenWalletAddress))
      .getWalletData();

    return jettonMasterAddress;
  }

  /**
   * @returns structure containing pending data
   *
   * @property {bigint} changeCustodianTs - Timestamp when 'change_custodian' was initiated
   * @property {bigint} sendMsgTs - Timestamp when 'send_raw_msg' was initiated
   * @property {bigint} codeUpgradeTs - Timestamp when 'code_upgrade' was initiated
   * @property {Address} newCustodian - New custodian that will be set after confirmation
   * @property {Cell} pendingMsg - Pending msg that will be sends after confirmation
   * @property {Cell} newCode - New contract code that will be set after confirmation
   * @property {Cell} newStorage - New contract storage that will be set after confirmation
   */
  public async getPendingData(provider: ContractProvider) {
    const result = await provider.get("get_pending_data", []);

    return {
      changeCustodianTs: result.stack.readBigNumber(),
      sendMsgTs: result.stack.readBigNumber(),
      codeUpgradeTs: result.stack.readBigNumber(),
      newCustodian: result.stack.readAddressOpt(),
      pendingMsg: result.stack.readCell(),
      newCode: result.stack.readCell(),
      newStorage: result.stack.readCell(),
    };
  }

  /**
   * @returns structure containing version data
   *
   * @property {number} major - Major version; breaking changes in api
   * @property {number} minor - Minor version; non-breaking new functionality
   * @property {string} development - Development version; can contain breaking changes
   */
  public async getVersion(provider: ContractProvider) {
    const result = await provider.get("get_version", []);

    return {
      major: result.stack.readNumber(),
      minor: result.stack.readNumber(),
      development: result.stack.readString(),
    };
  }

  /**
   * @returns structure containing current state of the minter
   *
   * @property {bigint} nextItemIndex - Index of the next nft in this collection
   * @property {number} status - Status of the contract: uninitialized `0`, operational `1`, pause_all `2`, frozen `3`, retired `4`,
   * @property {number} poolCount - Pools count
   * @property {bigint} currentStakedTokens - Number of staked tokens in basic token units
   * @property {bigint} contractUniqueId - Minter id
   * @property {bigint} minStakeTime - Minimum staking time
   * @property {Address} stakingTokenWallet - Minter's staking jetton wallet
   * @property {Address} custodianAddress - Custodian address
   * @property {boolean} canChangeCustodian - If can change custodian
   * @property {boolean} canSendRawMsg - If admin can send arbitrary raw msg from Minter
   * @property {Map<number, FarmDataAccrued>} farmDataAccrued - Accrued data for pools
   * @property {Map<number, FarmDataParameters>} farmDataParameters - Pools parameters
   */
  public async getFarmingMinterData(provider: ContractProvider) {
    const result = await provider.get("get_farming_minter_data", []);

    return {
      nextItemIndex: result.stack.readBigNumber(),
      status: result.stack.readNumber(),
      poolCount: result.stack.readNumber(),
      currentStakedTokens: result.stack.readBigNumber(),
      contractUniqueId: result.stack.readBigNumber(),
      minStakeTime: result.stack.readBigNumber(),
      stakingTokenWallet: result.stack.readAddress(),
      custodianAddress: result.stack.readAddress(),
      canChangeCustodian: result.stack.readBoolean(),
      canSendRawMsg: result.stack.readBoolean(),
      farmDataAccrued: (() => {
        const dict = result.stack
          .readCellOpt()
          ?.asSlice()
          .loadDictDirect(Dictionary.Keys.Uint(8), Dictionary.Values.Cell());

        const farmDataAccrued = new Map<number, FarmDataAccrued>();

        if (dict) {
          for (const poolIndex of dict.keys()) {
            const cell = dict.get(poolIndex);

            if (cell === undefined) {
              throw new Error(
                `Failed to parse farmDataAccrued from dict: ${dict}`,
              );
            }

            const slice = cell.beginParse();

            const accruedData = {
              depositedNanorewards: slice.loadUintBig(150),
              accruedPerUnitNanorewards: slice.loadUintBig(150),
              accruedFeeNanorewards: slice.loadUintBig(150),
              claimedNanorewards: slice.loadUintBig(150),
              claimedFeeNanorewards: slice.loadUintBig(150),
              accruedNanorewards: slice.loadUintBig(150),
              lastUpdateTime: slice.loadUintBig(64),
            };

            farmDataAccrued.set(poolIndex, accruedData);
          }
        }

        return farmDataAccrued;
      })(),
      farmDataParameters: (() => {
        const dict = result.stack
          .readCellOpt()
          ?.asSlice()
          .loadDictDirect(Dictionary.Keys.Uint(8), Dictionary.Values.Cell());

        const farmDataParameters = new Map<number, FarmDataParameters>();

        if (dict) {
          for (const poolIndex of dict.keys()) {
            const cell = dict.get(poolIndex);

            if (cell === undefined) {
              throw new Error(
                `Failed to parse farmDataParameters from dict: ${dict}`,
              );
            }

            const slice = cell.beginParse();

            const parametersData = {
              adminFee: slice.loadUintBig(16),
              nanorewardsPer24h: slice.loadUintBig(150),
              unrestrictedDepositRewards: slice.loadBit(),
              rewardTokenWallet: slice.loadAddress(),
              canChangeFee: slice.loadBit(),
              status: slice.loadUint(8),
            };
            farmDataParameters.set(poolIndex, parametersData);
          }
        }

        return farmDataParameters;
      })(),
    };
  }
}
