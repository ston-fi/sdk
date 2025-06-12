"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePoolsByAssetsQuery } from "@/hooks/use-pools-by-assets-query";
import { Formatter } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import type { PoolInfo } from "@ston-fi/api";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  useLiquidityProvideForm,
  useLiquidityProvideFormDispatch,
} from "../providers/liquidity-provide-form";

export const PoolSelect = () => {
  const [open, setOpen] = useState(false);

  const { assetB, assetA, pool } = useLiquidityProvideForm();
  const dispatch = useLiquidityProvideFormDispatch();

  const { isFetched, data } = usePoolsByAssetsQuery({
    asset0Address: assetA?.contractAddress,
    asset1Address: assetB?.contractAddress,
  });

  const handleFilter = (_: string, search: string, keywords: string[] = []) => {
    const [poolAddress = ""] = keywords;
    return poolAddress.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
  };

  const handleSelect = useCallback(
    (pool: PoolInfo) => {
      dispatch({ type: "SET_POOL", payload: pool });
      setOpen(false);
    },
    [dispatch],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this once when data is fetched
  useEffect(() => {
    const suggestedPool = data?.[0];

    if (suggestedPool) {
      handleSelect(suggestedPool);
    }
  }, [isFetched, handleSelect]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn("w-full px-2!")}
          disabled={!data}
        >
          {pool ? Formatter.address(pool.address) : "Select pool..."}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" avoidCollisions={false}>
        <Command filter={handleFilter}>
          <CommandInput
            placeholder="Search pool..."
            disabled={data?.length === 0}
          />
          <CommandList>
            <CommandEmpty>No pools found.</CommandEmpty>
            <CommandGroup>
              {data?.map((pool) => (
                <CommandItem
                  className="flex gap-2 justify-between"
                  key={pool.address}
                  value={pool.address}
                  keywords={[pool.address].filter(Boolean)}
                  onSelect={() => handleSelect(pool)}
                >
                  <span>{Formatter.address(pool.address)}</span>
                  <span>
                    {pool.lpTotalSupplyUsd
                      ? Formatter.fiatAmount(+pool.lpTotalSupplyUsd)
                      : null}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
