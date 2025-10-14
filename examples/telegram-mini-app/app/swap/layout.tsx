import { SwapFormProvider } from "./providers/swap-form";
import { SwapSettingsProvider } from "./providers/swap-settings";
import { SwapTransactionProvider } from "./providers/swap-transaction";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SwapSettingsProvider>
      <SwapFormProvider>
        <SwapTransactionProvider>{children}</SwapTransactionProvider>
      </SwapFormProvider>
    </SwapSettingsProvider>
  );
}
