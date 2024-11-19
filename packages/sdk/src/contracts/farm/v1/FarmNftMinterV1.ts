import {
  type Address,
  type Cell,
  type ContractProvider,
  type Sender,
  type SenderArguments,
  beginCell,
  toNano,
} from "@ton/ton";

import type { AddressType, AmountType, QueryIdType } from "../../../types";
import { createJettonTransferMessage } from "../../../utils/createJettonTransferMessage";
import { Contract, type ContractOptions } from "../../core/Contract";
import { JettonMinter } from "../../core/JettonMinter";
import { JettonWallet } from "../../core/JettonWallet";
import { FARM_OP_CODES, FARM_VERSION } from "../constants";

export interface FarmNftMinterV1Options extends ContractOptions {
  gasConstants?: Partial<typeof FarmNftMinterV1.gasConstants>;
}

/**
 * @deprecated `v1` version of the FarmNftMinter contracts is deprecated.
 *
 * Only use this version for get data contract calls.
 * For all other operations, use the latest version of the contract.
 */
export class FarmNftMinterV1 extends Contract {
  public static readonly version: FARM_VERSION = FARM_VERSION.v1;

  public static readonly gasConstants = {
    stake: toNano("0.3"),
    stakeForward: toNano("0.25"),
  };

  public readonly gasConstants;

  constructor(
    address: AddressType,
    { gasConstants, ...options }: FarmNftMinterV1Options = {},
  ) {
    super(address, options);

    this.gasConstants = {
      ...FarmNftMinterV1.gasConstants,
      ...gasConstants,
    };
  }

  public async createStakeBody(): Promise<Cell> {
    return beginCell().storeUint(FARM_OP_CODES.STAKE, 32).endCell();
  }

  /**
   * Build all data required to execute a jetton `stake` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.jettonAddress - Jetton address of token to be staked
   * @param {bigint | number} params.jettonAmount - Amount of tokens to be staked (in basic token units)
   * @param {bigint | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {bigint | number | string | undefined} params.forwardGasAmount - Optional; Custom transaction forward gas amount (in nanoTons)
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
      gasAmount?: AmountType;
      forwardGasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const [jettonWalletAddress, forwardPayload] = await Promise.all([
      provider
        .open(JettonMinter.create(params.jettonAddress))
        .getWalletAddress(params.userWalletAddress),
      this.createStakeBody(),
    ]);

    const forwardTonAmount = BigInt(
      params.forwardGasAmount ?? this.gasConstants.stakeForward,
    );

    const body = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.jettonAmount,
      destination: this.address,
      responseDestination: params.userWalletAddress,
      forwardTonAmount,
      forwardPayload,
    });

    const value = BigInt(params.gasAmount ?? this.gasConstants.stake);

    return {
      to: jettonWalletAddress,
      value,
      body,
    };
  }

  public async sendStake(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<FarmNftMinterV1["getStakeTxParams"]>[1],
  ) {
    const txParams = await this.getStakeTxParams(provider, params);

    return via.send(txParams);
  }

  /**
   * @returns structure containing current state of the minter
   *
   * @property {bigint} nextItemIndex - Index of the next nft in this collection
   * @property {bigint} lastUpdateTime - Last time farming values were updated
   * @property {number} status - Status of the contract: uninitialized `0`, active `1`, paused `3`
   * @property {bigint} depositedNanorewards - Deposited rewards in nanounits
   * @property {bigint} currentStakedTokens - Number of staked tokens in basic token units
   * @property {bigint} accruedPerUnitNanorewards - Number of accrued nanorewards per basic stake token unit
   * @property {bigint} accruedNanorewards - Total number of accrued rewards in nanounits
   * @property {bigint} claimedNanorewards - Number of claimed rewards in nanounits
   * @property {bigint} contractUniqueId - Minter id
   * @property {bigint} nanorewardsPer24h - Total number of accrued rewards per 24h in nanounits
   * @property {boolean} soulboundItems - Whether minted NFTs are soulbound
   * @property {bigint} minStakeTime - Minimum staking time
   * @property {Address} stakingTokenWallet - Minter's staking jetton wallet
   * @property {Address} rewardTokenWallet - Minter's reward jetton wallet
   */
  public async getFarmingMinterData(provider: ContractProvider) {
    const result = await provider.get("get_farming_minter_data", []);

    return {
      nextItemIndex: result.stack.readBigNumber(),
      lastUpdateTime: result.stack.readBigNumber(),
      status: result.stack.readNumber(),
      depositedNanorewards: result.stack.readBigNumber(),
      currentStakedTokens: result.stack.readBigNumber(),
      accruedPerUnitNanorewards: result.stack.readBigNumber(),
      accruedNanorewards: result.stack.readBigNumber(),
      claimedNanorewards: result.stack.readBigNumber(),
      contractUniqueId: result.stack.readBigNumber(),
      nanorewardsPer24h: result.stack.readBigNumber(),
      soulboundItems: result.stack.readBoolean(),
      minStakeTime: result.stack.readBigNumber(),
      stakingTokenWallet: result.stack.readAddress(),
      rewardTokenWallet: result.stack.readAddress(),
    };
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
}
