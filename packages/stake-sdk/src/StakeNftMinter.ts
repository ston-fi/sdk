import {
  Address,
  type Cell,
  type ContractProvider,
  type Sender,
  type SenderArguments,
  address,
  beginCell,
  toNano,
} from "@ton/ton";

import {
  Contract,
  type ContractOptions,
} from "../../sdk/src/contracts/core/Contract";
import { JettonMinter } from "../../sdk/src/contracts/core/JettonMinter";
import type { AddressType, AmountType, QueryIdType } from "../../sdk/src/types";
import { createJettonTransferMessage } from "../../sdk/src/utils/createJettonTransferMessage";
import { toAddress } from "../../sdk/src/utils/toAddress";

import { STAKE_OP_CODES } from "./constants";

export interface StakeNftMinterOptions extends ContractOptions {
  gasConstants?: Partial<typeof StakeNftMinter.gasConstants>;
}

export class StakeNftMinter extends Contract {
  public static readonly gasConstants = {
    stake: toNano("0.4"),
    stakeForward: toNano("0.3"),
  };

  public readonly gasConstants;

  constructor(
    address: AddressType,
    { gasConstants, ...options }: StakeNftMinterOptions = {},
  ) {
    super(address, options);

    this.gasConstants = {
      ...StakeNftMinter.gasConstants,
      ...gasConstants,
    };
  }

  public async createStakeBody(params: {
    durationSeconds: bigint | number;
    nftRecipient?: AddressType;
    tokenRecipient?: AddressType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(STAKE_OP_CODES.STAKE, 32)
      .storeUint(BigInt(params.durationSeconds), 64)
      .storeAddress(
        params.nftRecipient
          ? params.nftRecipient instanceof Address
            ? params.nftRecipient
            : address(params.nftRecipient)
          : undefined,
      )
      .storeAddress(
        params.tokenRecipient
          ? params.tokenRecipient instanceof Address
            ? params.tokenRecipient
            : address(params.tokenRecipient)
          : undefined,
      )
      .endCell();
  }

  /**
   * Build all data required to execute a STON `stake` transaction
   *
   * @param {Address | string} params.userWalletAddress - User's address
   * @param {Address | string} params.jettonAddress - Jetton's address
   * @param {Address | string | undefined} params.jettonWalletAddress - Address of the user's jetton wallet. If passed, will be used instead of fetching jetton wallet address from TON API via JettonMinter get method
   * @param {bigint | number} params.jettonAmount - Amount of jetton to be staked
   * @param {bigint | number} params.durationSeconds - Duration of the stake in seconds
   * @param {Address | string | undefined} params.nftRecipient - Address of the NFT recipient
   * @param {Address | string | undefined} params.tokenRecipient - Address of the token recipient
   * @param {bigint | number | string | undefined} params.gasAmount - Custom gas amount
   * @param {bigint | number | string | undefined} params.forwardGasAmount - Custom forward gas amount
   * @param {bigint | number | undefined} params.queryId - Optional query ID
   *
   * @returns {SenderArguments} containing all data required to execute a STON `stake` transaction
   */
  public async getStakeTxParams(
    provider: ContractProvider,
    params: {
      userWalletAddress: AddressType;
      jettonAddress: AddressType;
      jettonWalletAddress?: AddressType;
      jettonAmount: AmountType;
      durationSeconds: bigint | number;
      nftRecipient?: AddressType;
      tokenRecipient?: AddressType;
      gasAmount?: AmountType;
      forwardGasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const [jettonWalletAddress, forwardPayload, destination] =
      await Promise.all([
        params.jettonWalletAddress
          ? toAddress(params.jettonWalletAddress)
          : provider
              .open(JettonMinter.create(params.jettonAddress))
              .getWalletAddress(params.userWalletAddress),
        this.createStakeBody({
          durationSeconds: params.durationSeconds,
          nftRecipient: params.nftRecipient,
          tokenRecipient: params.tokenRecipient,
        }),
        this.address,
      ]);

    const forwardTonAmount = BigInt(
      params.forwardGasAmount ?? this.gasConstants.stakeForward,
    );

    const body = createJettonTransferMessage({
      queryId: params.queryId ?? 0,
      amount: params.jettonAmount,
      destination,
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
    params: Parameters<StakeNftMinter["getStakeTxParams"]>[1],
  ) {
    const txParams = await this.getStakeTxParams(provider, params);

    return via.send(txParams);
  }

  /**
   * @returns structure containing current state of the stake minter
   *
   * @property  {bigint} current_staked_tokens            Current amount of staked tokens
   * @property  {bigint} claimed_fractionrewards          Amount of claimed rewards in fractionunits
   * @property  {bigint} accrued_per_vote_fractionrewards Number of accrued nanorewards per basic stake token unit
   * @property  {bigint} accrued_fractionrewards          Total number of accrued rewards in fractionunits
   * @property  {bigint} reward_remainder                 Coins that didn't fit into `accrued_per_vote_fractionrewards` precision
   * @property  {bigint} total_vote_power                 Total voting power
   * @property  {bigint} id                               Contract id
   * @property  {bigint} lock_date                        Timestamp when `is_contract_locked` was change to `true`
   * @property  {bigint} origin_time                      Timestamp of `init` operation, used for exponent calculation
   * @property  {boolean} is_reward_deposit_locked         If deposit rewards is disabled
   * @property  {boolean} is_contract_locked               If staking, restaking, voting and deposit rewards are disabled
   * @property  {boolean} allow_instant_unstake            UNUSED
   * @property  {Address} staking_token_wallet             Minter's address of the staking token jetton wallet
   * @property  {Address} secondary_token_minter           Address of the `Minter` of the reward jetton
   */
  public async getStakingMinterData(provider: ContractProvider) {
    const result = await provider.get("get_staking_minter_data", []);

    return {
      current_staked_tokens: result.stack.readBigNumber(),
      claimed_fractionrewards: result.stack.readBigNumber(),
      accrued_per_vote_fractionrewards: result.stack.readBigNumber(),
      accrued_fractionrewards: result.stack.readBigNumber(),
      reward_remainder: result.stack.readBigNumber(),
      total_vote_power: result.stack.readBigNumber(),
      id: result.stack.readBigNumber(),
      lock_date: result.stack.readBigNumber(),
      origin_time: result.stack.readBigNumber(),
      is_reward_deposit_locked: result.stack.readBoolean(),
      is_contract_locked: result.stack.readBoolean(),
      allow_instant_unstake: result.stack.readBoolean(),
      staking_token_wallet: result.stack.readAddress(),
      secondary_token_minter: result.stack.readAddress(),
    };
  }
}
