import { LiquidityRefundFormProvider } from "./providers/liquidity-refund-form";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LiquidityRefundFormProvider>{children}</LiquidityRefundFormProvider>;
}
