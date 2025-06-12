"use client";

import { ExternalLink } from "lucide-react";
import type { ChangeEvent } from "react";

import { AssetSelect } from "@/components/asset-select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type AssetInfo, useAssetsQuery } from "@/hooks/use-assets-query";
import { Formatter } from "@/lib/formatter";
import { bigNumberToFloat, cn, validateFloatValue } from "@/lib/utils";

import { useLiquiditySimulationQuery } from "../hooks/liquidity-simulation-query";
import {
  useLiquidityProvideForm,
  useLiquidityProvideFormDispatch,
} from "../providers/liquidity-provide-form";
import { LiquidityProvisionTypeSwitch } from "./liquidity-provision-type-switch";
import { PoolSelect } from "./pool-select";

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

export const LiquidityProvideForm = (props: { className?: string }) => {
  return (
    <Card {...props}>
      <CardContent className="flex flex-col gap-4 p-6">
        <section>
          <AssetAHeader className="mb-1" />
          <div className="flex gap-2">
            <AssetASelect className="min-w-[150px] w-1/3 max-w-[150px]" />
            <AssetAInput />
          </div>
        </section>

        <section className="flex flex-col gap-1">
          <AssetBHeader />
          <div className="flex gap-2">
            <AssetBSelect className="min-w-[150px] w-1/3 max-w-[150px]" />
            <AssetBInput />
          </div>
        </section>

        <PoolSection />
      </CardContent>
    </Card>
  );
};

const AssetAHeader = (props: { className?: string }) => {
  return (
    <div
      {...props}
      className={cn(
        "flex items-center justify-between gap-2 text-sm text-muted-foreground",
        props.className,
      )}
    >
      Token 1
    </div>
  );
};

const AssetASelect = (props: { className?: string }) => {
  const { assetA } = useLiquidityProvideForm();
  const dispatch = useLiquidityProvideFormDispatch();

  const { data, isLoading } = useAssetsQuery({
    select: (data) => data.sort(sortAssets),
  });

  const handleAssetSelect = (asset: AssetInfo | null) => {
    dispatch({ type: "SET_ASSET_A", payload: asset });
  };

  return (
    <AssetSelect
      {...props}
      assets={data}
      selectedAsset={assetA}
      onAssetSelect={handleAssetSelect}
      loading={isLoading}
    />
  );
};

const AssetAInput = (props: { className?: string }) => {
  const { assetA, assetAUnits } = useLiquidityProvideForm();
  const dispatch = useLiquidityProvideFormDispatch();

  const { data } = useLiquiditySimulationQuery();

  const handleInputUpdate = ({ target }: ChangeEvent<HTMLInputElement>) => {
    if (target.value && !validateFloatValue(target.value)) return;

    dispatch({ type: "SET_ASSET_A_AMOUNT", payload: target.value });
  };

  const simulationValue = data?.tokenAUnits
    ? Formatter.units(data.tokenAUnits, assetA?.meta?.decimals ?? 9)
    : "";

  return (
    <Input
      {...props}
      disabled={!assetA}
      value={assetAUnits || simulationValue}
      onChange={handleInputUpdate}
    />
  );
};

const AssetBHeader = (props: { className?: string }) => {
  return (
    <div
      {...props}
      className={cn(
        "flex items-center justify-between gap-2 text-sm text-muted-foreground",
        props.className,
      )}
    >
      Token 2
    </div>
  );
};

const AssetBSelect = (props: { className?: string }) => {
  const { assetB, assetA } = useLiquidityProvideForm();
  const dispatch = useLiquidityProvideFormDispatch();

  const { data, isLoading } = useAssetsQuery({
    select: (data) =>
      data
        .filter((a) => a.contractAddress !== assetA?.contractAddress)
        .sort(sortAssets),
  });

  const handleAssetSelect = (asset: AssetInfo | null) => {
    dispatch({ type: "SET_ASSET_B", payload: asset });
  };

  return (
    <AssetSelect
      {...props}
      assets={data}
      selectedAsset={assetB}
      onAssetSelect={handleAssetSelect}
      loading={isLoading}
    />
  );
};

const AssetBInput = (props: { className?: string }) => {
  const { assetB, assetBUnits } = useLiquidityProvideForm();
  const dispatch = useLiquidityProvideFormDispatch();

  const { data } = useLiquiditySimulationQuery();

  const handleInputUpdate = ({ target }: ChangeEvent<HTMLInputElement>) => {
    if (target.value && !validateFloatValue(target.value)) return;

    dispatch({ type: "SET_ASSET_B_AMOUNT", payload: target.value });
  };

  const simulationValue = data?.tokenBUnits
    ? Formatter.units(data.tokenBUnits, assetB?.meta?.decimals ?? 9)
    : "";

  return (
    <Input
      {...props}
      disabled={!assetB}
      value={assetBUnits || simulationValue}
      onChange={handleInputUpdate}
    />
  );
};

const PoolSection = (props: { className?: string }) => {
  const { pool } = useLiquidityProvideForm();

  return (
    <section
      className={cn(
        "grid grid-cols-[1fr_100px] gap-y-1 gap-x-2",
        props.className,
      )}
    >
      <span className="inline-flex items-center text-sm text-muted-foreground col-span-2">
        Pool
        {pool ? (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://app.ston.fi/pools/${pool.address}`}
            className="ml-1"
          >
            <ExternalLink className="inline size-3 text-muted-foreground" />
          </a>
        ) : null}
      </span>
      <PoolSelect />
      <LiquidityProvisionTypeSwitch />
    </section>
  );
};
