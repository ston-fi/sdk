import { Suspense } from "react";
import {
  StakingStatsContent,
  StakingStatsFallback,
} from "./components/stake-stats";

export default function StakeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-[900px] w-full flex flex-col gap-4">
      <div className="my-12">
        <Suspense fallback={<StakingStatsFallback />}>
          <StakingStatsContent />
        </Suspense>
      </div>
      {children}
    </section>
  );
}
