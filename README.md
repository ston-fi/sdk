<div align="center" style="margin-bottom: 20px">
  <img
    alt="Ston.fi logo"
    height="100px"
    style="max-width: 100%; height: 100px;"
    src="https://static.ston.fi/branbook/ston/logo/black.svg"
  />
</div>

Our SDKs are written in TypeScript and designed to be thin wrappers on top of the [STON.fi](https://ston.fi) contracts, making it easier to integrate STON.fi protocols into JavaScript/TypeScript projects.

All SDKs are built on [@ton/ton](https://github.com/ton-org/ton) package

## SDKs

All SDKs can be found in the [`packages/`](https://github.com/ston-fi/sdk/tree/main/packages) directory

### [@ston-fi/sdk](https://github.com/ston-fi/sdk/tree/main/packages/sdk)

[![TON](https://img.shields.io/badge/based%20on-TON-blue)](https://ton.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@ston-fi/sdk/latest.svg)](https://www.npmjs.com/package/@ston-fi/sdk/v/latest)

SDK for interacting with STON.fi DEX contracts including Router, Pool, LpAccount, and pTON (proxyTON).

Key capabilities:

- Token swaps
- Liquidity management
  - Liquidity provision
  - Liquidity withdrawal

### [@ston-fi/stake-sdk](https://github.com/ston-fi/sdk/tree/main/packages/stake-sdk)

[![TON](https://img.shields.io/badge/based%20on-TON-blue)](https://ton.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@ston-fi/stake-sdk/latest.svg)](https://www.npmjs.com/package/@ston-fi/stake-sdk/v/latest)

SDK for interacting with STON.fi staking contracts (StakeNftMinter and StakeNftItem).

Key capabilities:

- Stake tokens
- Manage stake positions represented as NFTs
  - Unstake and claim rewards
  - Re-stake existing positions
  - Burn stake NFTs

## Next steps

### Take a look at the demo app

We provide a fully functional demo application showcasing SDK usage in a Next.js environment. The source code is open-source and available [here](https://github.com/ston-fi/sdk/tree/main/examples/next-js-app).

Try the demo app at https://sdk-demo-app.ston.fi

### Explore the documentation

Comprehensive guides and API references are available at https://docs.ston.fi/docs/developer-section/sdk