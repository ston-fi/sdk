import TonWeb from 'tonweb';

import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from '@ston-fi/sdk';

/**
 * This example shows how to provide liquidity to the pool
 * As a result, you will get LP tokens that can be used to refund your tokens from the pool.
 */
(async () => {
  const WALLET_ADDRESS = ''; // ! replace with your address
  const JETTON0 = 'EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO'; // STON
  const JETTON1 = 'EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA'; // jUSDT

  const provider = new TonWeb.HttpProvider();

  const router = new Router(provider, {
    revision: ROUTER_REVISION.V1,
    address: ROUTER_REVISION_ADDRESS.V1,
  });

  // transaction to provide 0.5 JETTON0 to JETTON0/JETTON1 pool
  const jetton0ProvisionTxParams =
    await router.buildProvideLiquidityJettonTxParams({
      // address of the wallet that holds jetton you want to provide
      userWalletAddress: WALLET_ADDRESS,
      // address of the jetton you want to provide
      sendTokenAddress: JETTON0,
      // amount of the jetton you want to provide
      sendAmount: new TonWeb.utils.BN('500000000'),
      // address of the second jetton you want to provide
      otherTokenAddress: JETTON1,
      // minimal amount of the LP tokens you want to receive as a result of the provision
      minLpOut: new TonWeb.utils.BN(1),
      // query id to identify your transaction in the blockchain (optional)
      queryId: 12345,
    });

  // to execute the transaction you need to send transaction to the blockchain
  // (replace with your wallet implementation, logging is used for demonstration purposes)
  console.log({
    to: jetton0ProvisionTxParams.to,
    amount: jetton0ProvisionTxParams.gasAmount,
    payload: jetton0ProvisionTxParams.payload,
  });

  // transaction to provide 0.2 JETTON1 to to JETTON0/JETTON1 pool
  const jetton1ProvisionTxParams =
    await router.buildProvideLiquidityJettonTxParams({
      // address of the wallet that holds jetton you want to provide
      userWalletAddress: WALLET_ADDRESS,
      // address of the jetton you want to provide
      sendTokenAddress: JETTON1,
      // amount of the jetton you want to provide
      sendAmount: new TonWeb.utils.BN('200000000'),
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
    to: jetton1ProvisionTxParams.to,
    amount: jetton1ProvisionTxParams.gasAmount,
    payload: jetton1ProvisionTxParams.payload,
  });

  // after execution of both transactions liquidity provision process will be completed
  // and you will receive pool LP tokens
})();
