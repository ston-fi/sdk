"use client";

import type { ChangeEvent } from "react";

import { AssetSelect } from "@/components/asset-select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type AssetInfo, useAssetsQuery } from "@/hooks/use-assets-query";
import { bigNumberToFloat, cn, validateFloatValue } from "@/lib/utils";

import { useSwapForm, useSwapFormDispatch } from "../providers/swap-form";

function assetUsdValue(asset: AssetInfo) {
  const balance = asset.balance;
  const decimals = asset.meta?.decimals ?? 9;
  const priceUsd = asset.dexPriceUsd;

  if (!balance || !priceUsd) return 0;

  return Number(bigNumberToFloat(balance, decimals)) * Number(priceUsd);
}

function sortAssets(a: AssetInfo, b: AssetInfo): number {
  const aUsdValue = assetUsdValue(a);
  const bUsdValue = assetUsdValue(b);

  if (aUsdValue && bUsdValue) {
    return bUsdValue - aUsdValue;
  }

  if (aUsdValue && !bUsdValue) return -1;
  if (!aUsdValue && bUsdValue) return 1;

  return 0;
}

export const SwapForm = (props: { className?: string }) => {
  return (
    <Card {...props}>
      <CardContent className="flex flex-col gap-4 p-6">
        <section>
          <OfferAssetHeader className="mb-1" />
          <div className="flex gap-2">
            <OfferAssetSelect className="min-w-[150px] w-1/3 max-w-[150px]" />
            <OfferAssetInput />
          </div>
        </section>

        <section className="flex flex-col gap-1">
          <AskAssetHeader />
          <div className="flex gap-2">
            <AskAssetSelect className="min-w-[150px] w-1/3 max-w-[150px]" />
            <AskAssetInput />
          </div>
        </section>
      </CardContent>
    </Card>
  );
};

const OfferAssetHeader = (props: { className?: string }) => {
  return (
    <div
      {...props}
      className={cn(
        "flex items-center justify-between gap-2 text-sm text-muted-foreground",
        props.className,
      )}
    >
      You offer
    </div>
  );
};

const OfferAssetSelect = (props: { className?: string }) => {
  const { offerAsset } = useSwapForm();
  const dispatch = useSwapFormDispatch();

  const { data, isLoading } = useAssetsQuery({
    select: (data) => data.sort(sortAssets),
  });

  const handleAssetSelect = (asset: AssetInfo | null) => {
    dispatch({ type: "SET_OFFER_ASSET", payload: asset });
  };

  return (
    <AssetSelect
      {...props}
      assets={data}
      selectedAsset={offerAsset}
      onAssetSelect={handleAssetSelect}
      loading={isLoading}
    />
  );
};

const OfferAssetInput = (props: { className?: string }) => {
  const { offerAsset, offerAmount } = useSwapForm();
  const dispatch = useSwapFormDispatch();

  const handleInputUpdate = ({ target }: ChangeEvent<HTMLInputElement>) => {
    if (target.value && !validateFloatValue(target.value)) return;

    dispatch({ type: "SET_OFFER_AMOUNT", payload: target.value });
  };

  return (
    <Input
      {...props}
      disabled={!offerAsset}
      value={offerAmount}
      onChange={handleInputUpdate}
    />
  );
};

const AskAssetHeader = (props: { className?: string }) => {
  return (
    <div
      {...props}
      className={cn(
        "flex items-center justify-between gap-2 text-sm text-muted-foreground",
        props.className,
      )}
    >
      You ask
    </div>
  );
};

const AskAssetSelect = (props: { className?: string }) => {
  const { askAsset, offerAsset } = useSwapForm();
  const dispatch = useSwapFormDispatch();

  const { data, isLoading } = useAssetsQuery({
    select: (data) =>
      data
        .filter((a) => a.contractAddress !== offerAsset?.contractAddress)
        .sort(sortAssets),
  });

  const handleAssetSelect = (asset: AssetInfo | null) => {
    dispatch({ type: "SET_ASK_ASSET", payload: asset });
  };

  return (
    <AssetSelect
      {...props}
      assets={data}
      selectedAsset={askAsset}
      onAssetSelect={handleAssetSelect}
      loading={isLoading}
    />
  );
};

const AskAssetInput = (props: { className?: string }) => {
  const { askAsset, askAmount } = useSwapForm();
  const dispatch = useSwapFormDispatch();

  const handleInputUpdate = ({ target }: ChangeEvent<HTMLInputElement>) => {
    if (target.value && !validateFloatValue(target.value)) return;

    dispatch({ type: "SET_ASK_AMOUNT", payload: target.value });
  };

  return (
    <Input
      {...props}
      disabled={!askAsset}
      value={askAmount}
      onChange={handleInputUpdate}
    />
  );
};
