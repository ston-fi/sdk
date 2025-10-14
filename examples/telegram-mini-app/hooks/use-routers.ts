import { type UseQueryOptions, useQuery } from "@tanstack/react-query";

import { type RouterInfo, getRouters } from "@/lib/routers-repository";

export const useRouters = (
  options?: Omit<
    UseQueryOptions<Map<RouterInfo["address"], RouterInfo>>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    ...options,
    queryKey: ["get-routers"],
    queryFn: async () => {
      const routers = await getRouters();

      return new Map(routers.map((router) => [router.address, router]));
    },
  });
