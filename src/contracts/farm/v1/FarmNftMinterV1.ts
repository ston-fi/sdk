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
import { parseAddressNotNull } from "@/utils/parseAddress";
import { parseBoolean } from "@/utils/parseBoolean";
import { createJettonTransferMessage } from "@/utils/createJettonTransferMessage";

import { FARM_OP_CODES, FARM_VERSION } from "../constants";

const {
  boc: { Cell },
  utils: { Address, BN },
  token: {
    nft: { NftCollection },
    jetton: { JettonWallet },
  },
} = TonWeb;

export interface FarmNftMinterV1Options
  extends SdkContractOptions,
    NftCollectionOptions {
  gasConstants?: Partial<typeof FarmNftMinterV1.gasConstants>;
}

export class FarmNftMinterV1 extends NftCollection {
  public static readonly version: FARM_VERSION = FARM_VERSION.v1;

  public static readonly gasConstants = {
    stake: new BN("300000000"),
    stakeForward: new BN("250000000"),
  };

  protected readonly stonApiClient;

  public readonly gasConstants;

  constructor({
    tonApiClient,
    stonApiClient,
    ...options
  }: FarmNftMinterV1Options) {
    super(tonApiClient, options);

    this.stonApiClient = stonApiClient ?? new StonApiClient(tonApiClient);
    this.gasConstants = {
      ...FarmNftMinterV1.gasConstants,
      ...options.gasConstants,
    };
  }

  protected async createStakeBody(): Promise<Cell> {
    const payload = new Cell();

    payload.bits.writeUint(FARM_OP_CODES.STAKE, 32);

    return payload;
  }

  /**
   * Build all data required to execute a jetton `stake` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.jettonAddress - Jetton address of token to be staked
   * @param {BN | number} params.jettonAmount - Amount of tokens to be staked (in basic token units)
   * @param {BN | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {BN | number | string | undefined} params.forwardGasAmount - Optional; Custom transaction forward gas amount (in nanoTons)
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
    const [jettonWalletAddress, forwardPayload, address] = await Promise.all([
      (async () =>
        new Address(
          await this.stonApiClient.getJettonWalletAddress({
            jettonAddress: params.jettonAddress.toString(),
            ownerAddress: params.userWalletAddress.toString(),
          }),
        ))(),
      this.createStakeBody(),
      this.getAddress(),
    ]);

    const forwardTonAmount = new BN(
      params.forwardGasAmount ?? this.gasConstants.stakeForward,
    );

    const payload = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.jettonAmount,
      destination: address,
      responseDestination: params.userWalletAddress,
      forwardTonAmount,
      forwardPayload,
    });

    const gasAmount = new BN(params.gasAmount ?? this.gasConstants.stake);

    return {
      to: new Address(jettonWalletAddress.toString(true, true, true)),
      payload,
      gasAmount,
    };
  }

  /**
   * @returns structure containing current state of the minter
   *
   * @property {BN} nextItemIndex - Index of the next nft in this collection
   * @property {BN} lastUpdateTime - Last time farming values were updated
   * @property {number} status - Status of the contract: uninitialized `0`, active `1`, paused `3`
   * @property {BN} depositedNanorewards - Deposited rewards in nanounits
   * @property {BN} currentStakedTokens - Number of staked tokens in basic token units
   * @property {BN} accruedPerUnitNanorewards - Number of accrued nanorewards per basic stake token unit
   * @property {BN} accruedNanorewards - Total number of accrued rewards in nanounits
   * @property {BN} claimedNanorewards - Number of claimed rewards in nanounits
   * @property {BN} contractUniqueId - Minter id
   * @property {BN} nanorewardsPer24h - Total number of accrued rewards per 24h in nanounits
   * @property {boolean} soulboundItems - Whether minted NFTs are soulbound
   * @property {BN} minStakeTime - Minimum staking time
   * @property {Address} stakingTokenWallet - Minter's staking jetton wallet
   * @property {Address} rewardTokenWallet - Minter's reward jetton wallet
   */
  public async getData() {
    const contractAddress = await this.getAddress();

    const result = await this.provider.call2(
      contractAddress.toString(),
      "get_farming_minter_data",
    );

    return {
      nextItemIndex: result[0] as BN,
      lastUpdateTime: result[1] as BN,
      status: (result[2] as BN).toNumber(),
      depositedNanorewards: result[3] as BN,
      currentStakedTokens: result[4] as BN,
      accruedPerUnitNanorewards: result[5] as BN,
      accruedNanorewards: result[6] as BN,
      claimedNanorewards: result[7] as BN,
      contractUniqueId: result[8] as BN,
      nanorewardsPer24h: result[9] as BN,
      soulboundItems: parseBoolean(result[10]),
      minStakeTime: result[11] as BN,
      stakingTokenWallet: parseAddressNotNull(result[12]),
      rewardTokenWallet: parseAddressNotNull(result[13]),
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
}
