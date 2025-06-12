import { LiquidityFormProvider } from "./providers/liquidity-provide-form";
import { LiquidityProvideSettingsProvider } from "./providers/liquidity-provide-settings";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LiquidityProvideSettingsProvider>
      <LiquidityFormProvider>{children}</LiquidityFormProvider>
    </LiquidityProvideSettingsProvider>
  );
}
