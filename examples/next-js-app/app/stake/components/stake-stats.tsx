import { fromUnits } from "@ston-fi/sdk";

import { Card } from "@/components/ui/card";
import { stonApiClient } from "@/lib/ston-api-client";

const StakingStatsContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
};

export async function StakingStatsContent() {
  const stats = await stonApiClient.getStakingStats();

  return (
    <StakingStatsContainer>
      {[
        {
          title: (
            <b className="text-lg font-medium">
              STON Price <small>(USD)</small>
            </b>
          ),
          value: Number(stats.stonPriceUsd).toFixed(2),
        },
        {
          title: (
            <b className="text-lg font-medium">
              STON <small>Total supply</small>
            </b>
          ),
          value: fromUnits(BigInt(stats.stonTotalSupply)),
        },
        {
          title: (
            <b className="text-lg font-medium">
              STON <small>Total staked</small>
            </b>
          ),
          value: fromUnits(BigInt(stats.totalStakedSton)),
        },
        {
          title: (
            <b className="text-lg font-medium">
              GEMSTON <small>Total supply</small>
            </b>
          ),
          value: fromUnits(BigInt(stats.gemstonTotalSupply)),
        },
      ].map((stat, index) => (
        <Card
          // biome-ignore lint/suspicious/noArrayIndexKey: not important here
          key={index}
          className=" h-[80px] p-2 flex justify-center flex-col gap-1"
        >
          {stat.title}
          {stat.value}
        </Card>
      ))}
    </StakingStatsContainer>
  );
}

export function StakingStatsFallback() {
  return <div className="w-full h-[80px]" />;
}
