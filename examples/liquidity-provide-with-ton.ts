import TonWeb from 'tonweb';

import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from '@ston-fi/sdk';

/**
 * This example shows how to provide liquidity to the pool where one of the tokens is TON
 * As a result, you will get LP tokens that can be used to refund your tokens from the pool.
 */
(async () => {
  const WALLET_ADDRESS = ''; // ! replace with your address
  const JETTON0 = 'EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO'; // STON
  const PROXY_TON = 'EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez'; // ProxyTON

  const provider = new TonWeb.HttpProvider();

  const router = new Router(provider, {
    revision: ROUTER_REVISION.V1,
    address: ROUTER_REVISION_ADDRESS.V1,
  });

  // Because TON is not a jetton, to be able to swap TON to jetton
  // you need to use special SDK method to build transaction to swap TON to jetton
  // using proxy jetton contract.

  // transaction to provide 1.0 TON to STON/TON pool
  const tonProvisionTxParams =
    await router.buildProvideLiquidityProxyTonTxParams({
      // address of the wallet that holds jetton you want to provide
      userWalletAddress: WALLET_ADDRESS,
      proxyTonAddress: PROXY_TON,
      // amount of TON you want to provide
      sendAmount: new TonWeb.utils.BN('1000000000'),
      // address of the second jetton you want to provide
      otherTokenAddress: JETTON0,
      // minimal amount of the LP tokens you want to receive as a result of the provision
      minLpOut: new TonWeb.utils.BN(1),
      // query id to identify your transaction in the blockchain (optional)
      queryId: 12345,
    });

  // to execute the transaction you need to send transaction to the blockchain
  // (replace with your wallet implementation, logging is used for demonstration purposes)
  console.log({
    to: tonProvisionTxParams.to,
    amount: tonProvisionTxParams.gasAmount,
    payload: tonProvisionTxParams.payload,
  });

  // transaction to provide 0.5 STON to STON/TON pool
  const jettonProvisionTxParams =
    await router.buildProvideLiquidityJettonTxParams({
      // address of the wallet that holds jetton you want to provide
      userWalletAddress: WALLET_ADDRESS,
      // address of the jetton you want to provide
      sendTokenAddress: JETTON0,
      // amount of the jetton you want to provide
      sendAmount: new TonWeb.utils.BN('500000000'),
      // address of the second jetton you want to provide
      otherTokenAddress: PROXY_TON,
      // minimal amount of the LP tokens you want to receive as a result of the provision
      minLpOut: new TonWeb.utils.BN(1),
      // query id to identify your transaction in the blockchain (optional)
      queryId: 12345,
    });

  // to execute the transaction you need to send transaction to the blockchain
  // (replace with your wallet implementation, logging is used for demonstration purposes)
  console.log({
    to: jettonProvisionTxParams.to,
    amount: jettonProvisionTxParams.gasAmount,
    payload: jettonProvisionTxParams.payload,
  });

  // after execution of both transactions liquidity provision process will be completed
  // and you will receive pool LP tokens
})();
