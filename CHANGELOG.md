# Changelog

## [0.5.3]

### Added

- Direct exports of `DEX` & `FARM` contracts of a specific version were added. If you are only interested in using, for example Farm v3 contracts specifically, now you can import only this version instead of an object with all versions.

```diff
- import { FARM } from "@ston-fi/sdk";
+ import { FARM } from "@ston-fi/sdk/farm/v3";

- const farm = new FARM.v3.NftMinter(/** */);
+ const farm = new FARM.NftMinter(/** */);
```

## [0.5.2]

### Changed

- contracts `create*Body` methods is public now
- jetton wallet address request in the `PoolV1.getJettonWallet` and `RouterV1.getPool` methods was changed from TonAPI to StonAPI

### Fixed

- Correct type for `FarmNftMinterV3.getVersion` `major` and `minor` fields. It was typed as a `number` but, in fact, was `BN`.

## [0.5.1]

### Changed

- `poolCount` in `FarmNftMinterV3.buildStakeTxParams` is now optional

## [0.5.0]

> **Breaking changes**
> Please look at the **Changed** section or at the [step-by-step migration guide](https://docs.ston.fi/docs/developer-section/sdk/0.4-migration-guide)

### Added

- Farm v1 contract
- Farm v3 contract
- pTON v1 contract
- If excess gas was defined in DEX operation, it will now be returned to the user's wallet address
- All SDK transactions now use bounceable addresses for `to` tx parameter
- SDK package now tree shakable

### Changed

- Contract revisions have been dropped

The original idea of having revision classes was to have the Contract class unchanged
and only make a new revision each time we introduce a new contract version.
In reality, each new version of the contract drastically varies from the previous one
so it became impossible to maintain a single abstracted interface on top of the revisions

Revision as a term was removed from the SDK, and now each contract has a static
`version` field to help identify the version of the contract.

Version enum keys was also changed from `V*` to `v*` to match with the StonFi API responses

Before
```js
import { Router, ROUTER_REVISION } from '@ston-fi/sdk';

const router = new Router(/** */, {
  revision: ROUTER_REVISION.V1
  // ...
});
```

After
```js
import { DEX } from "@ston-fi/sdk";

const router = new DEX.v1.Router(/** */)
```

- Contract constructor now accepts a single object with named parameters

Every SDK contract extends the contract from the TonWeb package. We are faced with the necessity
of passing custom fields along with those that are required by the TonWeb constructors.
With a new constructor parameters will now be able to pass comfortably
any parameters to the contracts and process them before passing them down to the TonWeb constructors

Now it became possible to partially or completely override default operations gas constants
in the constructor parameters. Previously it was required to create a custom revision
with overridden gas constants and pass it to the contract constructor to do so.

Before
```js
import TonWeb from 'tonweb';
import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from '@ston-fi/sdk';

const router = new Router(new TonWeb.HttpProvider(), {
  revision: ROUTER_REVISION.V1,
  address: ROUTER_REVISION_ADDRESS.V1,
});
```

After
```js
import TonWeb from 'tonweb';
import { DEX } from "@ston-fi/sdk";

const router = new DEX.v1.Router({
  tonApiClient: new TonWeb.HttpProvider()
});
```

- DEX swap methods were renamed

We received a lot of questions about how to swap jetton to TON because it uses the `buildSwapJettonTxParams.`
method with changed `askJettonAddress` parameter. So, we did eliminate this unclearness by splitting
`buildSwapJettonTxParams` method to `buildSwapJettonToJettonTxParams` and `buildSwapTonToJettonTxParams` methods.
`buildSwapProxyTonTxParams` was renamed to `buildSwapTonToJettonTxParams` to unify the naming convention.

Also, because there are now three independent methods, we were able to adjust gas constants
for each operation type, reducing the cost of the swap.

Before
```js
const swapJettonToJettonParams = await router.buildSwapJettonTxParams(/** */);
const swapJettonToTonParams = await router.buildSwapJettonTxParams({
  /** */
  askJettonAddress: PROXY_TON_ADDRESS,
});
const swapTonToJettonParams = await router.buildSwapProxyTonTxParams(/** */);
```

After
```js
const swapJettonToJettonParams = await router.buildSwapJettonToJettonTxParams(/** */);
const swapJettonToTonParams = await router.buildSwapJettonToTonTxParams(/** */);
const swapTonToJettonParams = await router.buildSwapTonToJettonTxParams(/** */);
```

- Interface of the Router v1 `getPoolAddress` method was unified with the `getPoolAddress`

Before
```js
const pool = await router.getPool({
  jettonAddresses: ["EQ...ABC", "EQ...CBA"],
});
```

After
```js
const pool = await router.getPool({
  token0: "EQ...ABC",
  token1: "EQ...CBA"
});
```

### Removed

- `parseAddressFromCell` util removed

## [0.4.0]

### Added

- ston Farm contracts (`FarmNftMinter`, `FarmNftItem`)

### Changed

- DEX contracts moved to the `contracts/dex` directory
- DEX contracts usage examples in `/examples` directory was prefixed with "dex-"
- `utils/parseAddressFromCell` util renamed to `parseAddress`

### Deprecated

- `parseAddressFromCell` util use deprecated
