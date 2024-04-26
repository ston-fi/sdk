import type TonWeb from "tonweb";
import type { StonApiClient as FillStonApiClient } from "@ston-fi/api";

export type TonApiProvider = InstanceType<typeof TonWeb.HttpProvider>;
export type BN = InstanceType<typeof TonWeb.utils.BN>;
export type Cell = InstanceType<typeof TonWeb.boc.Cell>;
export type Address = InstanceType<typeof TonWeb.utils.Address>;

export type AddressType = ConstructorParameters<typeof TonWeb.utils.Address>[0];
export type AmountType = ConstructorParameters<typeof TonWeb.utils.BN>[0];
export type QueryIdType = number | BN;

/**
 * @type {MessageData}
 *
 * @property {Address} to - Address to send the transaction to
 * @property {Cell} payload - Payload for the transaction
 * @property {BN} gasAmount - Amount of $TON (in nanoTons) to be sent as gas
 */
export interface MessageData {
  to: Address;
  payload: Cell;
  gasAmount: BN;
}

export interface StonApiClient
  extends Pick<FillStonApiClient, "getJettonWalletAddress"> {}

/**
 * This SDK is built on top of the TonWeb, and every SDK contracts
 * is an extended version of the corresponding TonWeb contract.
 *
 * Because of the way TonWeb is designed, tonApiClient (TonWeb.HttpProvider)
 * should be passed as the first argument to each instance of the contract.
 * This will allow a contract to make requests to the blockchain.
 *
 * But against TonWeb contract parameters, we also need a way
 * to pass custom constructor parameters to our extended contracts.
 * To be able to do this, we abstract two parameters of the TonWeb contracts constructor
 * (API provider and contract options) into a single object with named fields.
 * This way, we will be able to grab the parameters required for our extended contracts
 * and pass the rest to the TonWeb contract constructor.
 */
export interface SdkContractOptions {
  /**
   * This is a required parameter for every TonWeb contract instance
   * which every SDK contract is an extends of
   */
  tonApiClient: TonApiProvider;
  /**
   * This client will be used to get the on-chain data required for the SDK transaction building.
   *
   * Implementation via TonWeb.HttpProvider will be used if not provided
   */
  stonApiClient?: StonApiClient;
}
