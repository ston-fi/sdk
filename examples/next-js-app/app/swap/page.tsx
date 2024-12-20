import { ReferralForm } from "./components/referral-form";
import { SwapButton } from "./components/swap-button";
import { SwapForm } from "./components/swap-form";
import { SwapFormHeader } from "./components/swap-form-header";
import { SwapSimulationPreview } from "./components/swap-simulation";

export default function Home() {
  return (
    <section className="mx-auto w-full max-w-[500px] pt-4 md:pt-12 flex flex-col gap-4">
      <SwapFormHeader />
      <SwapForm />
      <ReferralForm />
      <SwapSimulationPreview />
      <SwapButton />
    </section>
  );
}
