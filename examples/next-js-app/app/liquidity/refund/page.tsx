import { LiquidityRefundButton } from "./components/liquidity-refund-button";
import { LiquidityRefundForm } from "./components/liquidity-refund-form";
import { LpAccountDataSection } from "./components/lp-account-data-section";

export default function LiquidityRefundPage() {
  return (
    <section className="mx-auto w-full max-w-[500px] pt-4 md:pt-12 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl leading-8 font-medium mr-auto">
          Refund liquidity
        </h1>
      </div>
      <LiquidityRefundForm />
      <LpAccountDataSection />
      <LiquidityRefundButton />
    </section>
  );
}
