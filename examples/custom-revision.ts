import TonWeb from 'tonweb';
import {
  LpAccountRevisionV1,
  PoolRevision,
  PoolRevisionV1,
  Router,
  RouterRevision,
  RouterRevisionV1,
} from '@ston-fi/sdk';

/**
 * This example shows how to create custom revision
 * for the router, pool, and lp-account classes
 */

class MyRouterRevision extends RouterRevisionV1 {
  // here you can override any method from default revision with your own implementation

  // if you will need custom pool revision, you need to override constructPoolRevision method
  public override constructPoolRevision: RouterRevision['constructPoolRevision'] = (
    router,
  ) => new MyPoolRevision();
}

class MyPoolRevision extends PoolRevisionV1 {
  // here you can override any method from default revision with your own implementation

  // if you will need custom lp account revision, you need to override constructLpAccountRevision method
  public override constructLpAccountRevision: PoolRevision['constructLpAccountRevision'] =
    (pool) => new MyLpAccountRevision();
}

class MyLpAccountRevision extends LpAccountRevisionV1 {
  // here you can override any method from default revision with your own implementation
}

const customRouter = new Router(new TonWeb.HttpProvider(), {
  revision: new MyRouterRevision(),
  address: 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt',
});
