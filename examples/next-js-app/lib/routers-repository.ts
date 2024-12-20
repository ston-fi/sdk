"use server";

import type { RouterInfo } from "@ston-fi/api";

import { stonApiClient } from "./ston-api-client";

const routersCache: Map<string, RouterInfo> = new Map();

export type { RouterInfo };

export const getRouter = async (routerAddress: string) => {
  try {
    const routerFromCache = routersCache.get(routerAddress);

    if (routerFromCache) return routerFromCache;

    const router = await stonApiClient.getRouter(routerAddress);

    routersCache.set(router.address, router);

    return router;
  } catch {
    return null;
  }
};

export const getRouters = async () => {
  try {
    if (!routersCache.size) {
      const routers = await stonApiClient.getRouters();

      for (const router of routers) {
        routersCache.set(router.address, router);
      }
    }

    return [...routersCache.values()];
  } catch {
    return [];
  }
};
