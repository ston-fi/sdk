<div align="center">
  <h1>STON.fi Stake SDK</h1>
</div>

[![TON](https://img.shields.io/badge/based%20on-TON-blue)](https://ton.org/)
[![License](https://img.shields.io/npm/l/@ston-fi/stake-sdk)](https://img.shields.io/npm/l/@ston-fi/stake-sdk)
[![npm version](https://img.shields.io/npm/v/@ston-fi/stake-sdk/latest.svg)](https://www.npmjs.com/package/@ston-fi/stake-sdk/v/latest)

## Installation

Firstly install the [@ton/ton](https://github.com/ton-org/ton) package following their [installation guide](https://github.com/ton-org/ton?tab=readme-ov-file#install)

Then, add the Stake SDK package using the package manager of your choice.

### NPM

```bash
npm install @ston-fi/stake-sdk
```

### Yarn

```bash
yarn add @ston-fi/stake-sdk
```

### PNPM

```bash
pnpm install @ston-fi/stake-sdk
```

## Usage

> [!NOTE]  
> The STON.fi STON stake contract address [`EQATQPeCwtMzQ9u54nTjUNcK4n_0VRSxPOOROLf_IE0OU3XK`](https://tonviewer.com/EQATQPeCwtMzQ9u54nTjUNcK4n_0VRSxPOOROLf_IE0OU3XK)

### Stake

In this example, we use a wallet for which we know the mnemonic for staking 1 STON for 3 months

```ts
import { MONTH_IN_SECONDS, StakeNftMinter } from "@ston-fi/stake-sdk";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { TonClient, WalletContractV5R1, toNano } from "@ton/ton";

const tonApiClient = new TonClient({
  endpoint: "https://toncenter.com/api/v2/jsonRPC",
});

const walletKeyPair = await mnemonicToPrivateKey(
  // replace with your mnemonic words
  ["your", "mnemonic", "words", "here"]
);

const wallet = tonApiClient.open(
  // be sure to use the correct wallet version (v4/v5/etc)
  WalletContractV5R1.create({
    workchain: 0,
    publicKey: walletKeyPair.publicKey,
  }),
);

const STAKE_CONTRACT_ADDRESS = "EQATQPeCwtMzQ9u54nTjUNcK4n_0VRSxPOOROLf_IE0OU3XK"; // STON stake contract
const STAKE_JETTON_ADDRESS = "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO"; // STON jetton minter

const stakeContract = tonApiClient.open(
  StakeNftMinter.create(STAKE_CONTRACT_ADDRESS),
);

await stakeContract.sendStake(
  wallet.sender(walletKeyPair.secretKey), 
  {
    jettonAddress: STAKE_JETTON_ADDRESS,
    userWalletAddress: wallet.address,
    jettonAmount: toNano("1"), // 1 STON
    durationSeconds: MONTH_IN_SECONDS * 3, // min - 3; max - 24 months
  }
);
```

### Unstake

In this code snippet, we are unstaking a position by building an unstake transaction message and sending it to the ton-connect for a sign

```tsx
import { MONTH_IN_SECONDS, StakeNftItem } from "@ston-fi/stake-sdk";
import { TonClient } from "@ton/ton";
import { useTonConnectUI } from "@tonconnect/ui-react";

const tonApiClient = new TonClient({
  endpoint: "https://toncenter.com/api/v2/jsonRPC",
});

const STAKE_NFT_ADDRESS = "" // put your nft address here

const stakeNftContract = tonApiClient.open(
  StakeNftItem.create(STAKE_NFT_ADDRESS),
);

function UnstakeAction() {
  const [tonConnectUI] = useTonConnectUI();

  return (
    <button
      type="button"
      onClick={async () => {
        const unstakeTxParams = await stakeNftContract.getUnstakeTxParams();

        await tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 5 * 60, // 5 minutes
          messages: [{
            address: unstakeTxParams.to.toString(),
            amount: unstakeTxParams.value.toString(),
            payload: unstakeTxParams.body?.toBoc().toString("base64"),
          }],
        });
      }}
    >
      Unstake {STAKE_NFT_ADDRESS}
    </button>
  )
}
```
