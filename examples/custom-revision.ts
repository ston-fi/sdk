import TonWeb from 'tonweb';
import {
  LpAccount,
  LpAccountRevisionV1,
  Pool,
  PoolRevision,
  PoolRevisionV1,
  Router,
  RouterRevision,
  RouterRevisionV1,
} from '@ston-fi/sdk';

// You can define your own revison for router
class MyRouterRevision extends RouterRevisionV1 {
  public createSwapBody: RouterRevision['createSwapBody'] = async (
    router,
    params,
  ) => {
    // Replace super-call here with your own method implementation

    return super.createSwapBody(router, params);
  };

  // Override construct pool if you need custom pool revision
  public constructPool: RouterRevision['constructPool'] = (
    router,
    poolAddress,
  ) => {
    return new Pool(
      router.provider,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        address: poolAddress,
        revision: new MyPoolRevision(),
      },
    );
  };
}

// Also you can define your own revison for pool
class MyPoolRevision extends PoolRevisionV1 {
  public getExpectedLiquidity: PoolRevision['getExpectedLiquidity'] = async (
    pool,
    params,
  ) => {
    // Replace super-call here with your own method implementation

    return super.getExpectedLiquidity(pool, params);
  };

  // Override if you need custom lp account revision
  public constructLpAccount: PoolRevision['constructLpAccount'] = (
    pool,
    lpAccountAddress,
  ) => {
    return new LpAccount(pool.provider, {
      address: lpAccountAddress,
      revision: new MyLpAccountRevision(),
    });
  };
}

// And also for lp account
class MyLpAccountRevision extends LpAccountRevisionV1 {}

async () => {
  const provider = new TonWeb.HttpProvider();

  // Create router with your own revision
  const router = new Router(provider, {
    revision: new MyRouterRevision(),
    address: 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt',
  });
};
