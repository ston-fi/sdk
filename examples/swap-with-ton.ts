import TonWeb from 'tonweb';

import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from '@ston-fi/sdk';

/**
 * This example shows how to swap TON to jetton using the router contract
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

  // transaction to swap 1.0 TON to JETTON0 but not less than 1 nano JETTON0
  const tonToJettonTxParams = await router.buildSwapProxyTonTxParams({
    // address of the wallet that holds TON you want to swap
    userWalletAddress: WALLET_ADDRESS,
    proxyTonAddress: PROXY_TON,
    // amount of the TON you want to swap
    offerAmount: TonWeb.utils.toNano('1'), // 1.0
    // address of the jetton you want to receive
    askJettonAddress: JETTON0,
    // minimal amount of the jetton you want to receive as a result of the swap.
    // If the amount of the jetton you want to receive is less than minAskAmount
    // the transaction will bounce
    minAskAmount: new TonWeb.utils.BN(1),
    // query id to identify your transaction in the blockchain (optional)
    queryId: 12345,
    // address of the wallet to receive the referral fee (optional)
    referralAddress: undefined,
  });

  // to execute the transaction you need to send transaction to the blockchain
  // (replace with your wallet implementation, logging is used for demonstration purposes)
  console.log({
    to: tonToJettonTxParams.to,
    amount: tonToJettonTxParams.gasAmount,
    payload: tonToJettonTxParams.payload,
  });

  // reverse transaction is just a regular swap transaction where `askJettonAddress` is a ProxyTon address.
  // see swap example for more details
})();
