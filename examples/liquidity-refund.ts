import TonWeb from 'tonweb';

import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from '@ston-fi/sdk';

/**
 * This example shows how to refund liquidity from the your lp-account
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

  const pool = await router.getPool({
    jettonAddresses: [JETTON0, JETTON1],
  });

  if (!pool) {
    throw Error(`Pool for ${JETTON0}/${JETTON1} not found`);
  }

  const lpAccount = await pool.getLpAccount({ ownerAddress: WALLET_ADDRESS });

  if (!lpAccount) {
    throw Error(
      `LpAccount for ${WALLET_ADDRESS} at ${JETTON0}/${JETTON1} pool not found`,
    );
  }

  // transaction to refund all tokens from JETTON0/JETTON1 lp-account contract
  const refundTxParams = await lpAccount.buildRefundTxParams({
    // query id to identify your transaction in the blockchain (optional)
    queryId: 12345,
  });

  // to execute the transaction you need to send transaction to the blockchain
  // (replace with your wallet implementation, logging is used for demonstration purposes)
  console.log({
    to: refundTxParams.to,
    amount: refundTxParams.gasAmount,
    payload: refundTxParams.payload,
  });
})();
