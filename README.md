<div align="center" style="margin-bottom: 20px">
  <img
    alt="STON.fi logo"
    height="100px"
    style="max-width: 100%; height: 100px;"
    src="https://static.ston.fi/branbook/ston/logo/black.svg"
  />
</div>

This monorepo contains the TypeScript SDKs for [STON.fi](https://ston.fi) contracts and a React example app showing how to integrate them.

## Documentation

Read the [SDK documentation](https://docs.ston.fi/docs/developer-section/sdk) for integration guides and API references.

## Example app

We maintain a [React example app](https://sdk-demo-app.ston.fi) illustrating how to use the SDKs, with [source code](https://github.com/ston-fi/sdk/tree/main/examples/next-js-app) available.

## SDKs

All SDKs can be found in the [`packages/`](https://github.com/ston-fi/sdk/tree/main/packages) directory. They are thin wrappers around STON.fi contracts, built on [@ton/ton](https://github.com/ton-org/ton) for use in JavaScript and TypeScript applications.

### [@ston-fi/sdk](https://github.com/ston-fi/sdk/tree/main/packages/sdk)

[![TON](https://img.shields.io/badge/based%20on-TON-blue)](https://ton.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@ston-fi/sdk/latest.svg)](https://www.npmjs.com/package/@ston-fi/sdk/v/latest)

The DEX SDK provides typed access to STON.fi contracts, including Router, Pool, LpAccount, and pTON (proxyTON), for token swaps and liquidity provision and withdrawal. Use it to read contract state and build transaction messages for your wallet integration.

Router information ties together a router's address, contract version and type, and pTON configuration. The SDK's `dexFactory` and `routerFactory` helpers use this information to select the matching contract wrappers. If you don't know the router or need a list of available routers, use `GET /v1/routers` or `GET /v1/routers/{address}` from the [public STON.fi API (Swagger)](https://api.ston.fi/swagger-ui/), or call `getRouters()` or `getRouter(address)` through [@ston-fi/api](https://github.com/ston-fi/api), a thin TypeScript wrapper around the public API.

### [@ston-fi/stake-sdk](https://github.com/ston-fi/sdk/tree/main/packages/stake-sdk)

[![TON](https://img.shields.io/badge/based%20on-TON-blue)](https://ton.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@ston-fi/stake-sdk/latest.svg)](https://www.npmjs.com/package/@ston-fi/stake-sdk/v/latest)

The staking SDK provides typed access to STON.fi staking contracts (`StakeNftMinter` and `StakeNftItem`). Use it to stake tokens and manage positions represented as NFTs, including unstaking, claiming rewards, re-staking, and burning stake NFTs.
