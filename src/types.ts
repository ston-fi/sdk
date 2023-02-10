import TonWeb, {
  ContractOptions as TW_ContractOptions,
  JettonMinterOptions as TW_JettonMinterOptions,
} from 'tonweb';

export type Address = InstanceType<typeof TonWeb.utils.Address>;
export type Cell = InstanceType<typeof TonWeb.boc.Cell>;
export type BitString = InstanceType<typeof TonWeb.boc.BitString>;
export type Contract = InstanceType<typeof TonWeb.Contract>;
export type HttpProvider = InstanceType<typeof TonWeb.HttpProvider>;
export type JettonMinter = InstanceType<typeof TonWeb.token.ft.JettonMinter>;
export type JettonWallet = InstanceType<typeof TonWeb.token.ft.JettonWallet>;
export type BN = InstanceType<typeof TonWeb.utils.BN>;
export type AddressType = string | Address;
export type QueryIdType = number | BN;
export interface ContractOptions extends TW_ContractOptions {}
export interface JettonMinterOptions extends TW_JettonMinterOptions {}

/**
 * @type {MessageData}
 *
 * @property {Address} to - Address of the router's Jetton wallet for the swapped token
 * @property {Cell} payload - Payload for transaction
 * @property {BN} gasAmount - Recommended amount of $TON (in nanoTons) sent as gas
 */
export interface MessageData {
  to: Address;
  payload: Cell;
  gasAmount: BN;
}
