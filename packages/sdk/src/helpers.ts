import type { RouterInfo } from "@ston-fi/api";

import { DEX, DEX_TYPE } from "./contracts/dex";

/**
 * Returns a set of DEX contracts for the given version and type of the router.
 * Useful for defining the set of contracts based on the API information about the router.
 * Throws if the version or type is not supported.
 *
 * @param {number} routerInfo.majorVersion - The major version of the router.
 * @param {number} routerInfo.minorVersion - The minor version of the router.
 * @param {string | undefined} routerInfo.routerType - The type of router.
 *
 * @returns The set of contracts for the given version.
 */
export function dexFactory(
  routerInfo: Pick<RouterInfo, "majorVersion" | "minorVersion"> & {
    routerType?: RouterInfo["routerType"] | DEX_TYPE;
  },
) {
  const { majorVersion, minorVersion } = routerInfo;

  if (majorVersion === 1 && minorVersion === 0) {
    return DEX.v1;
  }

  if (majorVersion === 2 && minorVersion === 1) {
    if (routerInfo.routerType) {
      const contracts = {
        ...DEX.v2_1,
        /**
         * @deprecated. `dexFactory` will return the correct router class to work with, not a generic one
         * Left for backward compatibility for those, who use `dexFactory().Router.*` syntax
         */
        _Router: DEX.v2_1.Router,
        /**
         * @deprecated. `dexFactory` will return the correct router class to work with, not a generic one
         * Left for backward compatibility for those, who use `dexFactory().Pool.*` syntax
         */
        _Pool: DEX.v2_1.Pool,
      } as const;

      switch (routerInfo.routerType) {
        case DEX_TYPE.CPI:
        case "ConstantProduct": {
          return {
            ...contracts,
            Router: DEX.v2_1.Router.CPI,
            Pool: DEX.v2_1.Pool.CPI,
          };
        }
        case DEX_TYPE.Stable:
        case "StableSwap": {
          return {
            ...contracts,
            Router: DEX.v2_1.Router.Stable,
            Pool: DEX.v2_1.Pool.Stable,
          };
        }
        case DEX_TYPE.WCPI:
        case "WeightedConstProduct": {
          return {
            ...contracts,
            Router: DEX.v2_1.Router.WCPI,
            Pool: DEX.v2_1.Pool.WCPI,
          };
        }
        case DEX_TYPE.WStable:
        case "WeightedStableSwap": {
          return {
            ...contracts,
            Router: DEX.v2_1.Router.WStable,
            Pool: DEX.v2_1.Pool.WStable,
          };
        }
        default: {
          throw new Error(`Unsupported router type: ${routerInfo.routerType}`);
        }
      }
    }

    return DEX.v2_1;
  }

  if (majorVersion === 2 && minorVersion === 2) {
    if (routerInfo.routerType) {
      const contracts = {
        ...DEX.v2_2,
        /**
         * @deprecated. `dexFactory` will return the correct router class to work with, not a generic one
         * Left for backward compatibility for those, who use `dexFactory().Router.*` syntax
         */
        _Router: DEX.v2_2.Router,
        /**
         * @deprecated. `dexFactory` will return the correct router class to work with, not a generic one
         * Left for backward compatibility for those, who use `dexFactory().Pool.*` syntax
         */
        _Pool: DEX.v2_2.Pool,
      } as const;

      switch (routerInfo.routerType) {
        case DEX_TYPE.CPI:
        case "ConstantProduct": {
          return {
            ...contracts,
            Router: DEX.v2_2.Router.CPI,
            Pool: DEX.v2_2.Pool.CPI,
          };
        }
        case DEX_TYPE.Stable:
        case "StableSwap": {
          return {
            ...contracts,
            Router: DEX.v2_2.Router.Stable,
            Pool: DEX.v2_2.Pool.Stable,
          };
        }
        case DEX_TYPE.WCPI:
        case "WeightedConstProduct": {
          return {
            ...contracts,
            Router: DEX.v2_2.Router.WCPI,
            Pool: DEX.v2_2.Pool.WCPI,
          };
        }
        case DEX_TYPE.WStable:
        case "WeightedStableSwap": {
          return {
            ...contracts,
            Router: DEX.v2_2.Router.WStable,
            Pool: DEX.v2_2.Pool.WStable,
          };
        }
        default: {
          throw new Error(`Unsupported router type: ${routerInfo.routerType}`);
        }
      }
    }

    return DEX.v2_2;
  }

  throw new Error(`Unsupported dex version: ${majorVersion}.${minorVersion}`);
}

/**
 * Returns an instance of the router contract for the given version, address and type.
 * Useful for creating a router based on the API information about the router.
 * Throws if the version or type is not supported.
 *
 * @param {Address | string} routerInfo.address - The address of the router.
 * @param {number} routerInfo.majorVersion - The major version of the router.
 * @param {number} routerInfo.minorVersion - The minorVersion version of the router.
 * @param {string | undefined} routerInfo.routerType - The type of router.
 *
 * @returns {Router} The instance of the router contract.
 */
export function routerFactory(
  routerInfo: Pick<RouterInfo, "address" | "majorVersion" | "minorVersion"> & {
    routerType?: RouterInfo["routerType"] | DEX_TYPE;
  },
) {
  const { Router } = dexFactory(routerInfo);

  return Router.create(routerInfo.address);
}
