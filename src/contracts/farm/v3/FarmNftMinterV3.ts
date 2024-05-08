import TonWeb, { type NftCollectionOptions } from "tonweb";

import type {
  BN,
  Cell,
  Address,
  AddressType,
  QueryIdType,
  MessageData,
  AmountType,
  SdkContractOptions,
} from "@/types";
import { StonApiClient } from "@/StonApiClient";
import { parseAddress, parseAddressNotNull } from "@/utils/parseAddress";
import { parseBoolean } from "@/utils/parseBoolean";
import { parseString } from "@/utils/parseString";
import { createJettonTransferMessage } from "@/utils/createJettonTransferMessage";
import { parseDictionaryCell } from "@/utils/parseDictionary";
import { parseCell } from "@/utils/parseCell";

import { FARM_OP_CODES, FARM_VERSION } from "../constants";

const {
  boc: { Cell },
  utils: { Address, BN },
  token: {
    nft: { NftCollection },
    jetton: { JettonWallet },
  },
} = TonWeb;

/**
 *  @type {FarmDataAccrued} represent state of the accrued data for pool
 *
 * @property {BN} depositedNanorewards - Deposited rewards in nanounits
 * @property {BN} accruedPerUnitNanorewards - Number of accrued nanorewards per basic stake token unit
 * @property {BN} accruedFeeNanorewards - Accrued fees
 * @property {BN} claimedNanorewards - Number of claimed rewards in nanounits
 * @property {BN} claimedFeeNanorewards - Claimed fees
 * @property {BN} accruedNanorewards - Total number of accrued rewards in nanounits
 * @property {BN} lastUpdateTime - Last time farming values were updated
 */
export type FarmDataAccrued = {
  depositedNanorewards: BN;
  accruedPerUnitNanorewards: BN;
  accruedFeeNanorewards: BN;
  claimedNanorewards: BN;
  claimedFeeNanorewards: BN;
  accruedNanorewards: BN;
  lastUpdateTime: BN;
};

/**
 *  @type {FarmDataParameters} represent state of the pool parameters
 *
 * @property {BN} adminFee - Admin fee; divider is 10000
 * @property {BN} nanorewardsPer24h - Total number of accrued rewards per 24h in nanounits
 * @property {boolean} unrestrictedDepositRewards - If rewards can be deposited by anyone
 * @property {Address} rewardTokenWallet - Minter's reward jetton wallet
 * @property {boolean} canChangeFee - If can change fee
 * @property {BN} status - Status of the contract
 */
export type FarmDataParameters = {
  adminFee: BN;
  nanorewardsPer24h: BN;
  unrestrictedDepositRewards: boolean;
  rewardTokenWallet: Address;
  canChangeFee: boolean;
  status: number;
};

export interface FarmNftMinterV3Options
  extends SdkContractOptions,
    NftCollectionOptions {
  address: Required<NftCollectionOptions>["address"];
  gasConstants?: Partial<typeof FarmNftMinterV3.gasConstants>;
}

export class FarmNftMinterV3 extends NftCollection {
  public static readonly version: FARM_VERSION = FARM_VERSION.v3;

  public static readonly gasConstants = {
    stakeFwdBase: new BN("210000000"),
    stakeFwdPerPool: new BN("15000000"),
    stake: new BN("100000000"),
  };

  protected readonly stonApiClient;

  public readonly gasConstants;

  constructor({
    tonApiClient,
    stonApiClient,
    gasConstants,
    ...options
  }: FarmNftMinterV3Options) {
    super(tonApiClient, options);

    this.stonApiClient = stonApiClient ?? new StonApiClient(tonApiClient);
    this.gasConstants = {
      ...FarmNftMinterV3.gasConstants,
      ...gasConstants,
    };
  }

  public async createStakeBody(params?: {
    ownerAddress?: AddressType;
  }): Promise<Cell> {
    const payload = new Cell();

    payload.bits.writeUint(FARM_OP_CODES.STAKE, 32);
    payload.bits.writeAddress(
      params?.ownerAddress ? new Address(params.ownerAddress) : undefined,
    );

    return payload;
  }

  /**
   * Build all data required to execute a jetton `stake` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.jettonAddress - Jetton address of token to be staked
   * @param {BN | number} params.jettonAmount - Amount of tokens to be staked (in basic token units)
   * @param {number | undefined} params.poolCount - Optional; Number of deployed farm reward pools; If undefined value will get onchain
   * @param {Address | string} params.ownerAddress - Optional; custom owner of stake; if undefined stake owner is sender address
   * @param {BN | number | undefined} params.queryId - Optional; query id
   *
   * @returns {MessageData} containing all data required to execute a jetton `stake` transaction
   */
  public async buildStakeTxParams(params: {
    userWalletAddress: AddressType;
    jettonAddress: AddressType;
    jettonAmount: AmountType;
    poolCount?: number;
    ownerAddress?: AddressType;
    queryId?: QueryIdType;
  }): Promise<MessageData> {
    const [jettonWalletAddress, forwardPayload, address, poolCount] =
      await Promise.all([
        (async () =>
          new Address(
            await this.stonApiClient.getJettonWalletAddress({
              jettonAddress: params.jettonAddress.toString(),
              ownerAddress: params.userWalletAddress.toString(),
            }),
          ))(),
        this.createStakeBody({
          ownerAddress: params.ownerAddress,
        }),
        this.getAddress(),
        (async () => params.poolCount ?? (await this.getData()).poolCount)(),
      ]);

    const forwardTonAmount = this.gasConstants.stakeFwdBase.add(
      this.gasConstants.stakeFwdPerPool.muln(poolCount + 1),
    );

    const payload = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.jettonAmount,
      destination: address,
      responseDestination: params.userWalletAddress,
      forwardTonAmount,
      forwardPayload,
    });

    const gasAmount = forwardTonAmount.add(this.gasConstants.stake);

    return {
      to: new Address(jettonWalletAddress.toString(true, true, true)),
      payload,
      gasAmount,
    };
  }

  /**
   * @returns {Address} address of minter for staking jetton that is used for farming
   */
  public async getStakingJettonAddress(): Promise<Address> {
    const { stakingTokenWallet } = await this.getData();

    const jettonWallet = new JettonWallet(this.provider, {
      address: stakingTokenWallet,
    });

    const { jettonMinterAddress } = await jettonWallet.getData();

    return jettonMinterAddress;
  }

  /**
   * @returns structure containing pending data
   *
   * @property {BN} changeCustodianTs - Timestamp when 'change_custodian' was initiated
   * @property {BN} sendMsgTs - Timestamp when 'send_raw_msg' was initiated
   * @property {BN} codeUpgradeTs - Timestamp when 'code_upgrade' was initiated
   * @property {Address} newCustodian - New custodian that will be set after confirmation
   * @property {Cell} pendingMsg - Pending msg that will be sends after confirmation
   * @property {Cell} newCode - New contract code that will be set after confirmation
   * @property {Cell} newStorage - New contract storage that will be set after confirmation
   */
  public async getPendingData() {
    const contractAddress = await this.getAddress();

    const result = await this.provider.call2(
      contractAddress.toString(),
      "get_pending_data",
    );

    return {
      changeCustodianTs: result[0] as BN,
      sendMsgTs: result[1] as BN,
      codeUpgradeTs: result[2] as BN,
      newCustodian: parseAddress(result[3]),
      pendingMsg: result[4] as Cell,
      newCode: result[5] as Cell,
      newStorage: result[6] as Cell,
    };
  }

  /**
   * @returns structure containing version data
   *
   * @property {number} major - Major version; breaking changes in api
   * @property {number} minor - Minor version; non-breaking new functionality
   * @property {string} development - Development version; can contain breaking changes
   */
  public async getVersion() {
    const contractAddress = await this.getAddress();

    const result = await this.provider.call2(
      contractAddress.toString(),
      "get_version",
    );

    return {
      major: (result[0] as BN).toNumber(),
      minor: (result[1] as BN).toNumber(),
      development: parseString(result[2]),
    };
  }

  /**
   * @returns structure containing current state of the minter
   *
   * @property {BN} nextItemIndex - Index of the next nft in this collection
   * @property {number} status - Status of the contract: uninitialized `0`, operational `1`, pause_all `2`, frozen `3`, retired `4`,
   * @property {number} poolCount - Pools count
   * @property {BN} currentStakedTokens - Number of staked tokens in basic token units
   * @property {BN} contractUniqueId - Minter id
   * @property {BN} minStakeTime - Minimum staking time
   * @property {Address} stakingTokenWallet - Minter's staking jetton wallet
   * @property {Address} custodianAddress - Custodian address
   * @property {boolean} canChangeCustodian - If can change custodian
   * @property {boolean} canSendRawMsg - If admin can send arbitrary raw msg from Minter
   * @property {Map<number, FarmDataAccrued>} farmDataAccrued - Accrued data for pools
   * @property {Map<number, FarmDataParameters>} farmDataParameters - Pools parameters
   */
  public async getData() {
    const contractAddress = await this.getAddress();

    const result = await this.provider.call2(
      contractAddress.toString(),
      "get_farming_minter_data",
    );

    const farmDataAccruedDict = parseDictionaryCell(result[10] as Cell, 8);
    const farmDataAccrued = new Map<number, FarmDataAccrued>();

    farmDataAccruedDict.forEach((cell, poolIndex) => {
      const slice = parseCell(cell);
      const accruedData = {
        depositedNanorewards: slice.loadUint(150),
        accruedPerUnitNanorewards: slice.loadUint(150),
        accruedFeeNanorewards: slice.loadUint(150),
        claimedNanorewards: slice.loadUint(150),
        claimedFeeNanorewards: slice.loadUint(150),
        accruedNanorewards: slice.loadUint(150),
        lastUpdateTime: slice.loadUint(64),
      };

      farmDataAccrued.set(Number(poolIndex), accruedData);
    });

    const farmDataParametersDict = parseDictionaryCell(result[11] as Cell, 8);
    const farmDataParameters = new Map<number, FarmDataParameters>();

    farmDataParametersDict.forEach((cell, poolIndex) => {
      const slice = parseCell(cell);
      const parametersData = {
        adminFee: slice.loadUint(16),
        nanorewardsPer24h: slice.loadUint(150),
        unrestrictedDepositRewards: slice.loadBit(),
        rewardTokenWallet: slice.loadAddress(),
        canChangeFee: slice.loadBit(),
        status: slice.loadUint(8).toNumber(),
      };

      farmDataParameters.set(Number(poolIndex), parametersData);
    });

    return {
      nextItemIndex: result[0] as BN,
      status: (result[1] as BN).toNumber(),
      poolCount: (result[2] as BN).toNumber(),
      currentStakedTokens: result[3] as BN,
      contractUniqueId: result[4] as BN,
      minStakeTime: result[5] as BN,
      stakingTokenWallet: parseAddressNotNull(result[6]),
      custodianAddress: parseAddressNotNull(result[7]),
      canChangeCustodian: parseBoolean(result[8]),
      canSendRawMsg: parseBoolean(result[9]),
      farmDataAccrued: farmDataAccrued,
      farmDataParameters: farmDataParameters,
    };
  }
}
