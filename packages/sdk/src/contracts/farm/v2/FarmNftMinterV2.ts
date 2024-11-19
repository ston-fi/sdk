import type { ContractProvider } from "@ton/ton";

import { FARM_VERSION } from "../constants";
import {
  FarmNftMinterV1,
  type FarmNftMinterV1Options,
} from "../v1/FarmNftMinterV1";

export interface FarmNftMinterV2Options extends FarmNftMinterV1Options {}

/**
 * @deprecated `v2` version of the FarmNftMinter contracts is deprecated.
 *
 * Only use this version for get data contract calls.
 * For all other operations, use the latest version of the contract.
 */
export class FarmNftMinterV2 extends FarmNftMinterV1 {
  public static override version = FARM_VERSION.v2;

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
   * @property {bigint} lastUpdateTime - Last time farming values were updated
   * @property {number} status - Status of the contract: uninitialized `0`, active `1`, paused `3`
   * @property {bigint} depositedNanorewards - Deposited rewards in nanounits
   * @property {bigint} currentStakedTokens - Number of staked tokens in basic token units
   * @property {bigint} accruedPerUnitNanorewards - Number of accrued nanorewards per basic stake token unit
   * @property {bigint} claimedFeeNanorewards - Claimed fees
   * @property {bigint} accruedFeeNanorewards - Accrued fees
   * @property {bigint} accruedNanorewards - Total number of accrued rewards in nanounits
   * @property {bigint} claimedNanorewards - Number of claimed rewards in nanounits
   * @property {bigint} contractUniqueId - Minter id
   * @property {bigint} nanorewardsPer24h - Total number of accrued rewards per 24h in nanounits
   * @property {bigint} adminFee - Admin fee; divider is 10000
   * @property {bigint} minStakeTime - Minimum staking time
   * @property {Address} stakingTokenWallet - Minter's staking jetton wallet
   * @property {Address} rewardTokenWallet - Minter's reward jetton wallet
   * @property {Address} custodianAddress - Custodian address
   * @property {boolean} canChangeCustodian - If can change custodian
   * @property {boolean} canSendRawMsg - If can send raw msg
   * @property {boolean} canChangeFee - If can change fee
   * @property {boolean} unrestrictedDepositRewards - If rewards can be deposited by anyone
   * @property {boolean} soulboundItems - Whether minted NFTs are soulbound; Always true in V2
   */
  public override async getFarmingMinterData(provider: ContractProvider) {
    const result = await provider.get("get_farming_minter_data", []);

    return {
      nextItemIndex: result.stack.readBigNumber(),
      lastUpdateTime: result.stack.readBigNumber(),
      status: result.stack.readNumber(),
      depositedNanorewards: result.stack.readBigNumber(),
      currentStakedTokens: result.stack.readBigNumber(),
      accruedPerUnitNanorewards: result.stack.readBigNumber(),
      claimedFeeNanorewards: result.stack.readBigNumber(),
      accruedFeeNanorewards: result.stack.readBigNumber(),
      accruedNanorewards: result.stack.readBigNumber(),
      claimedNanorewards: result.stack.readBigNumber(),
      contractUniqueId: result.stack.readBigNumber(),
      nanorewardsPer24h: result.stack.readBigNumber(),
      adminFee: result.stack.readBigNumber(),
      minStakeTime: result.stack.readBigNumber(),
      stakingTokenWallet: result.stack.readAddress(),
      rewardTokenWallet: result.stack.readAddress(),
      custodianAddress: result.stack.readAddressOpt(),
      canChangeCustodian: result.stack.readBoolean(),
      canSendRawMsg: result.stack.readBoolean(),
      canChangeFee: result.stack.readBoolean(),
      unrestrictedDepositRewards: result.stack.readBoolean(),

      // NFTs are always soulbound in V2
      soulboundItems: true,
    };
  }
}
