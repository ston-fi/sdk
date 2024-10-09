# Changelog

## [2.0.0-rc.7]

### Changed

- Because of the frequent cases of pTON contracts being used with the uncopiable Router we changed the type declaration of the pTON in the Router contracts to allow only the pTON contract with the same version as the Router. Now Error will be thrown in case of mismatching versions

```ts
const router = client.open(DEX.v2_1.Router.create('EQ...'));

const txParams = await router.getSwapTonToJettonTxParams({
  // ...
  proxyTon: pTON.v1.create('EQ...'),
});

// [Error]: The version of the provided pTON (v1) does not match the expected version (v2_1)
```

- `Contract.create` method generic type declaration were rewritten to solve an issue with inferring the contract type. Before, following code caused a ts error, and now it will work just fine

```ts
const router: RouterV1 | RouterV2_1;

router.create('EQ...')
// ^
// The 'this' context of type 'typeof RouterV1 | typeof RouterV2_1'
//   is not assignable to method's 'this' of type 'new (address: AddressType) => RouterV1'.
// Types of construct signatures are incompatible.
```

### Added

- pTON contract was added to the `DEX` object exported for each dex version to simplify it usage and illuminate additional import.

```ts
import { DEX } from '@ston-fi/sdk/dex/v2_1';

const { Router, pTON } = DEX;
```

- `dexFactory` helper was added. This method will return the DEX object with all needed contracts of the correct version based on `majorVersion` & `minorVersion` fields from the RouterInfo from the API

```ts
import { StonApiClient } from "@ston-fi/api";
import { dexFactory } from "@ston-fi/sdk";

const apiClient = new StonApiClient();

const routerInfo = await apiClient.getRouter('EQ...');

const dex = dexFactory(routerInfo);

const router = dex.Router.create(routerInfo.address);
const pTON = dex.pTON.create(routerInfo.ptonMasterAddress);
```

- `routerFactory` helper was added. This method is similar to the `dexFactory` and also requires the RouterInfo from the API as an argument. As a result, it will return the Router contract instance of the correct version initialized with the `address` from the RouterInfo object

- `@ton/ton@^15.0.0` was listed as a valid peer dependency

## [2.0.0-rc.6]

### Added

- Router v2_1 address validation has been added. It will throw an error if Router v2_1 is initialized with the v1 address. This is needed to prevent users from fund loss caused by the operation execution on an invalid router version
- All test snapshots were updated with values from actual v2_1 contracts

## [2.0.0-rc.5]

### Changed

- dex `v2` was deprecated and removed from the SDK. A new version, `v2_1,` was introduced instead.
  `v2` contracts were only deployed in the testnet and will never be deployed in the main net.
  `v2_1` has a few changes in comparison to the previous version:
  - some operation codes were changed
  - The optional parameter `deadline` was added to the swap & liquidity provide operations. This parameter is motivated by blockchain issues with TX processing that happen occasionally at a high load. If the transaction execution takes more time than defined by the `deadline` (15 min by default), the transaction will bounce.

The migration from `v2` to `v2_1` is pretty simple:

```diff
const router = client.open(
--  DEX.v2.Router.create(
++  DEX.v2_1.Router.create(
--    "kQCas2p939ESyXM_BzFJzcIe3GD5S0tbjJDj6EBVn-SPsEkN" // CPI Router v2.0.0
++    "kQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWk0v" // CPI Router v2.1.0
  )
);
```

- pTON `v2` was deprecated and removed from the SDK. A new version, `v2_1,` was introduced instead.
  `v2` contracts were only deployed in the testnet and will never be deployed in the main net.

The migration from `v2` to `v2_1` is pretty simple:

```diff
-- const proxyTon = pTON.v2.create(
++ const proxyTon = pTON.v2_1.create(
--  "kQDwpyxrmYQlGDViPk-oqP4XK6J11I-bx7fJAlQCWmJB4m74" // pTON v2.0.0
++  "kQACS30DNoUQ7NfApPvzh7eBmSZ9L4ygJ-lkNWtba8TQT-Px" // pTON v2.1.0
);
```

### Added

- Because of the recent appearance of the [Mintless Jettons](https://gist.github.com/EmelyanenkoK/bfe633bdf8e22ca92a5138e59134988f) ability to pass `custom_payload` to [jetton transfer message](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md#1-transfer) became a necessity, optional `jettonCustomPayload` parameter was added to all dex operations that are jettonTransfer's
  - swap
    - `RouterV1.getSwapJettonToJettonTxParams`
    - `RouterV1.getSwapJettonToTonTxParams`
    - `RouterV2_1.getSwapJettonToJettonTxParams`
    - `RouterV2_1.getSwapJettonToTonTxParams`
  - liquidity provision
    - `RouterV1.getProvideLiquidityJettonTxParams`
    - `RouterV2_1.getProvideLiquidityJettonTxParams`
    - `RouterV2_1.getSingleSideProvideLiquidityJettonTxParams`

Here is an example of how swap with non yet minted [Points](https://tonviewer.com/EQD6Z9DHc5Mx-8PI8I4BjGX0d2NhapaRAK12CgstweNoMint) jetton could be achieved

```ts
  import { WalletContractV4, TonClient, Cell, internal, toNano } from "@ton/ton";
  import { mnemonicToPrivateKey } from "@ton/crypto";
  import { DEX } from "@ston-fi/sdk";

  const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: '', // specify API key to avoid rate limits
  });

  const keyPair = await mnemonicToPrivateKey([]);

  const offerJettonAddress = 'EQD6Z9DHc5Mx-8PI8I4BjGX0d2NhapaRAK12CgstweNoMint'; // Mintless Points
  const askJettonAddress = 'EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez'; // pTON v1

  const wallet = client.open(WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey }));

  // 1. request jetton data, to verify should claim be preformed or not

  const offerJettonData = await (fetch(`https://tonapi.io/v2/accounts/${wallet.address.toString()}/jettons/${offerJettonAddress}?supported_extensions=custom_payload`).then((res) => res.json()));

  console.log('offerJettonData', offerJettonData);

  let customPayload: Cell | undefined;
  let stateInit: { code: Cell, data: Cell } | undefined;

  // 2. if jetton is not minted, request the `custom_payload` and `state_init` for it

  if (offerJettonData.extensions?.includes('custom_payload')) {
    const offerJettonCustomPayload = await (fetch(`${offerJettonData.jetton.custom_payload_api_uri}/wallet/${wallet.address.toString()}`).then((res) => res.json()));

    const customPayload = Cell.fromBoc(Buffer.from(offerJettonCustomPayload.custom_payload, 'base64'))[0];
    const stateInitCell = Cell.fromBoc(Buffer.from(offerJettonCustomPayload.state_init, 'base64'))[0].beginParse();

    stateInit = {
      code: stateInitCell.loadRef(),
      data: stateInitCell.loadRef(),
    };
  }

  // 3. build swap tx params with custom payload if needed

  const router = client.open(DEX.v1.Router.create(DEX.v1.Router.address));
  const txParams = await router.getSwapJettonToJettonTxParams({
    userWalletAddress: wallet.address,
    askJettonAddress,
    offerJettonAddress,
    offerAmount: toNano(0.1),
    minAskAmount: 1,
    jettonCustomPayload: customPayload,
    // slightly increase gas amount to avoid out of gas error in case if init is required
    gasAmount: stateInit ? DEX.v1.Router.gasConstants.swapJettonToJetton.gasAmount + toNano(0.1) : undefined,
  });

  // 4. send swap tx to the network with state init if needed

  await wallet.sendTransfer({
    seqno: await wallet.getSeqno(),
    secretKey: keyPair.secretKey,
    messages: [internal({
      ...txParams,
      init: stateInit,
    })],
  })
}
```

### Removed

- `RouterV2_1.createCrossProvideLiquidityBody` removed. Cross provide liquidity will not be implemented in this contract version

## [2.0.0-rc.3]

### Added

- methods for deploy pTON wallet (`pTON.createDeployWalletBody`, `pTON.getDeployWalletTxParams`, `pTON.sendDeployWallet`)

## [2.0.0-rc.2]

### Added

- add validation for optional `referralValue` argument in `BaseRouterV2.createCrossSwapBody` method

### Fixed

- correct range (in basis point) for custom `referralValue` argument in `BaseRouterV2`

## [2.0.0-rc.1]

### Added

- new Router v2 `createCrossSwapBody` method
- new Router v2 `createCrossProvideLiquidityBody` method
- add validation for optional `referralValue` argument in `createSwapBody`
- DEX v2 contracts fully covered with tests

### Changed

- `token` parameter of the Router v2 `getVault` method was renamed to `tokenMinter`

## [2.0.0-rc.0]

### Added

- DEX v2 contracts (`Router`, `Pool`, `LpAccount`, `Vault`);
You can find a full list of DEX  v2 features in our [DOCS](https://docs.ston.fi/docs/developer-section/api-reference-v2)

- pTON v2 contract

## [1.0.2]

### Added

- New major release version of the @ton/ton package was allowed as allowed dependency

### Fixed

- Correct parsing for a `null` dictionary value in the `FarmNftItemV3.getFarmingData.claimedPerUnit` filed
- Correct parsing for a `null` dictionary value in the `FarmNftMinterV3.getFarmingMinterData.farmDataAccrued` filed
- Correct parsing for a `null` dictionary value in the `FarmNftMinterV3.getFarmingMinterData.farmDataParameters` filed

## [1.0.1]

### Fixed

- Correct parsing for a 0 `accruedPerUnitNanorewards` value in the `FarmNftItemV3.getFarmingData.claimedPerUnit` field.

## [1.0.0]

> **Breaking changes**
> Please look at the **Changed** section or at the [step-by-step migration guide](https://docs.ston.fi/docs/developer-section/sdk/0.5-migration-guide)

During the development of the DEX v2 contracts, we identified several feature gaps in the [tonweb](https://github.com/toncenter/tonweb) package, which our SDK relied on. Additionally, a survey within the DEV community revealed that most developers use the [ton-org](https://github.com/ton-org) packages in their projects. Consequently, we have decided to migrate from [tonweb](https://github.com/toncenter/tonweb) to [ton-org](https://github.com/ton-org) packages as our core dependency.

We understand that this change may be unexpected and require additional work for some of you. However, we believe this move is necessary and beneficial in the long run. Our team has already completed this migration in our product, and it was a smooth transition. Moreover, projects already using the ton-center package will benefit from a significant reduction in dependencies.

This release is functionally fully equivalent to the previous stable release, `0.5.3`

### Changed

- The contract constructor interface signature was changed

Address now is the first parameter for the contract constructor instead of the named field in the configuration object

```diff
const router = new DEX.v1.Router(
- {
-   address: "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt",
- }
+ "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt"
);
```

SDK contracts no longer require `tonApiClient` to be passed in each contract constructor.
By design of the ton-core library, contracts should be opened with a provider to make on-chain requests.

```diff
const router = new DEX.v1.Router(
- {
-   tonApiClient: new TonWeb.HttpProvider('https://ton-api.ston.fi/jsonRPC'),
- }
);
```

Custom `gasConstants` could be specified in the contract configuration object that could be passed as the second argument to the constructor.

```diff
const router = new DEX.v1.Router(
- {
-   address: "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt",
-   gasConstants: { /** */ }
- }
+ "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt",
+ { gasConstants: { /** */ } }
);
```

- `build*TxParams` methods was renamed to `get*TxParams`

```diff
- const txParams = await router.buildSwapTonToJettonTxParams({ /** */ });

+ const txParams = await router.getSwapTonToJettonTxParams({ /** */ });
```

- Amount is now represented in native js `BigInt` instead of `BN` from [bn.js](https://github.com/indutny/bn.js)

You can replace `BN` usage with `BigInt` OR use strings, and SDK will wrap them in BigInt under the hood.

```diff
const txParams = await router.getSwapTonToJettonTxParams({
-  offerAmount: new TonWeb.utils.BN("1000000000"),
+  offerAmount: BigInt("1000000000"),
  // ...
});
```

- Operations with proxyTon now require an instance of pTON contract instead of just an address.

```diff
const txParams = await router.getSwapTonToJettonTxParams({
-  proxyTonAddress: pTON.v1.address,
+  proxyTon: new pTON.v1(),
  // ...
});
```

- The `get*TxParams` methods now return objects with the type `SenderArguments` instead of `MessageData`. The purpose and shape of those objects almost identical, but these changes allow us to fit ton-core notation better and implement `send*`
methods

Before
```js
const txParams = await router.getSwapTonToJettonTxParams({ /** */ }); // { to, payload, gasAmount }
```

After
```js
const txParams = await router.getSwapTonToJettonTxParams({ /** */ }); // { to, body, value }
```

- `RouterV1.getData` method was renamed to `RouterV1.getRouterData` to match contract API
- `PoolV1.getData` method was renamed to `PoolV1.getPoolData` to match contract API
- `LpAccountV1.getData` method was renamed to `LpAccountV1.getLpAccountData` to match contract API
- `gasConstants` for swap using Router v1 has been decreased

### Added

- Contracts now have static `create` method to simplify instance creation.

```js
import { FARM } from '@ston-fi/sdk/farm/v3';

const nft = FARM.NftItem.create('EQ...');
```

- Contracts now have `send*` methods to simplify transaction sending with the @ton-core package

```js
const wallet = client.open(WalletContractV4.create({ workchain, publicKey: keyPair.publicKey }));
const router = client.open(new DEX.v1.Router());

await router.sendSwapTonToJetton(
  wallet.sender(keyPair.secretKey),
  {
    // tx arguments for `getSwapTonToJettonTxParams` method to build tx params
  },
);
```

- `RouterV1.getPoolAddressByJettonMinters` method was added to simplify pool address determination by jetton minter addresses. Not router jetton wallet addresses as required in `RouterV1.getPoolAddress` method.

```js
const pool = openedRouter.getPoolAddressByJettonMinters({
  token0: 'EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO', // STON minter
  token1: 'EQBX6K9aXVl3nXINCyPPL86C4ONVmQ8vK360u6dykFKXpHCa', // GEMSTON minter
})
```

### Removed

- `MessageData` has been replaced with `SenderArguments` type
- `*_OP_CODES` enum exports was removed
- `parse*` util functions exports was removed

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
