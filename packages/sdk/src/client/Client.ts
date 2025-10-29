import { StonApiClient } from "@ston-fi/api";
import { Address, beginCell, TonClient, TupleReader } from "@ton/ton";

export class Client extends TonClient {
  private stonApiClient: StonApiClient;

  constructor(
    options: ConstructorParameters<typeof TonClient>[0] & {
      stonApiClient?: StonApiClient;
    },
  ) {
    super(options);

    this.stonApiClient = options.stonApiClient ?? new StonApiClient();
  }

  public override async callGetMethod(
    ...args: Parameters<TonClient["callGetMethod"]>
  ) {
    if (args[1] === "get_wallet_address" && args[2]?.[0]?.type === "slice") {
      try {
        const jettonWalletAddress =
          await this.stonApiClient.getJettonWalletAddress({
            jettonAddress: args[0].toString(),
            ownerAddress: args[2][0].cell.beginParse().loadAddress().toString(),
          });

        return {
          gas_used: 0,
          stack: new TupleReader([
            {
              type: "slice",
              cell: beginCell()
                .storeAddress(Address.parse(jettonWalletAddress))
                .endCell(),
            },
          ]),
        };
      } catch {
        //
      }
    }

    return super.callGetMethod(...args);
  }
}
