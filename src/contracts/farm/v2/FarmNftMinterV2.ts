import TonWeb from "tonweb";

import type { BN, Cell } from "@/types";
import { parseAddress, parseAddressNotNull } from "@/utils/parseAddress";
import { parseBoolean } from "@/utils/parseBoolean";
import { parseString } from "@/utils/parseString";

import { FARM_VERSION } from "../constants";
import {
  FarmNftMinterV1,
  type FarmNftMinterV1Options,
} from "../v1/FarmNftMinterV1";

const {
  utils: { BN },
} = TonWeb;

export interface FarmNftMinterV2Options extends FarmNftMinterV1Options {}

export class FarmNftMinterV2 extends FarmNftMinterV1 {
  public static version = FARM_VERSION.v2;

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
   * @property {BN} lastUpdateTime - Last time farming values were updated
   * @property {number} status - Status of the contract: uninitialized `0`, active `1`, paused `3`
   * @property {BN} depositedNanorewards - Deposited rewards in nanounits
   * @property {BN} currentStakedTokens - Number of staked tokens in basic token units
   * @property {BN} accruedPerUnitNanorewards - Number of accrued nanorewards per basic stake token unit
   * @property {BN} claimedFeeNanorewards - Claimed fees
   * @property {BN} accruedFeeNanorewards - Accrued fees
   * @property {BN} accruedNanorewards - Total number of accrued rewards in nanounits
   * @property {BN} claimedNanorewards - Number of claimed rewards in nanounits
   * @property {BN} contractUniqueId - Minter id
   * @property {BN} nanorewardsPer24h - Total number of accrued rewards per 24h in nanounits
   * @property {BN} adminFee - Admin fee; divider is 10000
   * @property {BN} minStakeTime - Minimum staking time
   * @property {Address} stakingTokenWallet - Minter's staking jetton wallet
   * @property {Address} rewardTokenWallet - Minter's reward jetton wallet
   * @property {Address} custodianAddress - Custodian address
   * @property {boolean} canChangeCustodian - If can change custodian
   * @property {boolean} canSendRawMsg - If can send raw msg
   * @property {boolean} canChangeFee - If can change fee
   * @property {boolean} unrestrictedDepositRewards - If rewards can be deposited by anyone
   * @property {boolean} soulboundItems - Whether minted NFTs are soulbound; Always true in V2
   */
  public override async getData() {
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
      claimedFeeNanorewards: result[6] as BN,
      accruedFeeNanorewards: result[7] as BN,
      accruedNanorewards: result[8] as BN,
      claimedNanorewards: result[9] as BN,
      contractUniqueId: result[10] as BN,
      nanorewardsPer24h: result[11] as BN,
      adminFee: result[12] as BN,
      minStakeTime: result[13] as BN,
      stakingTokenWallet: parseAddressNotNull(result[14]),
      rewardTokenWallet: parseAddressNotNull(result[15]),
      custodianAddress: parseAddress(result[16]),
      canChangeCustodian: parseBoolean(result[17]),
      canSendRawMsg: parseBoolean(result[18]),
      canChangeFee: parseBoolean(result[19]),
      unrestrictedDepositRewards: parseBoolean(result[20]),

      // NFTs are always soulbound in V2
      soulboundItems: true,
    };
  }
}
