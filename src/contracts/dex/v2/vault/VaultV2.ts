import {
  type Cell,
  type ContractProvider,
  type Sender,
  type SenderArguments,
  beginCell,
  toNano,
} from "@ton/ton";

import type { QueryIdType, AmountType, AddressType } from "@/types";
import { Contract, type ContractOptions } from "@/contracts/core/Contract";
import { DEX_VERSION, DEX_OP_CODES } from "@/contracts/dex/constants";

export interface VaultV2Options extends ContractOptions {
  gasConstants?: Partial<typeof VaultV2.gasConstants>;
}

/**
 * Token vault stores referral fees on a separate contract similar to an LP account.
 * This will allow us to decrease TX fees for swaps since users won't have to pay for additional Jetton transfer TX.
 *
 * Vault address is defined by router_address, owner_address and router_token_Wallet_address,
 * so, for each token, each user can have a dedicated vault contract.
 */
export class VaultV2 extends Contract {
  public static readonly version = DEX_VERSION.v2;

  public static readonly gasConstants = {
    withdrawFee: toNano("0.3"),
  };

  public readonly gasConstants;

  constructor(
    address: AddressType,
    { gasConstants, ...options }: VaultV2Options = {},
  ) {
    super(address, options);

    this.gasConstants = {
      ...VaultV2.gasConstants,
      ...gasConstants,
    };
  }

  public async createWithdrawFeeBody(params?: {
    queryId?: QueryIdType;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(DEX_OP_CODES.WITHDRAW_FEE, 32)
      .storeUint(params?.queryId ?? 0, 64)
      .endCell();
  }

  /**
   * Build all data required to execute a `withdraw_fee` transaction.
   *
   * @param {ContractProvider} provider - {@link ContractProvider} instance
   *
   * @param {object | undefined} params - Optional tx params
   * @param {bigint | number | string | undefined} params.gasAmount - Optional; Custom transaction gas amount (in nanoTons)
   * @param {bigint | number | undefined} params.queryId - Optional; query id
   *
   *
   * @returns {SenderArguments} all data required to execute a `withdraw_fee` transaction.
   */
  public async getWithdrawFeeTxParams(
    provider: ContractProvider,
    params?: {
      gasAmount?: AmountType;
      queryId?: QueryIdType;
    },
  ): Promise<SenderArguments> {
    const to = this.address;

    const body = await this.createWithdrawFeeBody({
      queryId: params?.queryId,
    });

    const value = BigInt(params?.gasAmount ?? this.gasConstants.withdrawFee);

    return { to, body, value };
  }

  public async sendWithdrawFee(
    provider: ContractProvider,
    via: Sender,
    params: Parameters<VaultV2["getWithdrawFeeTxParams"]>[1],
  ) {
    const txParams = await this.getWithdrawFeeTxParams(provider, params);

    return via.send(txParams);
  }

  /**
   * Get the current state of the vault contract.
   *
   * @param {ContractProvider} provider - {@link ContractProvider} instance
   *
   *
   * @returns {Promise<object>} structure containing the current state of the vault contract.
   */
  public async getVaultData(provider: ContractProvider) {
    const result = await provider.get("get_vault_data", []);

    return {
      ownerAddress: result.stack.readAddress(),
      tokenAddress: result.stack.readAddress(),
      routerAddress: result.stack.readAddress(),
      depositedAmount: result.stack.readBigNumber(),
    };
  }
}
