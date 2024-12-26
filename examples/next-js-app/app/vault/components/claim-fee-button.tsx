import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useTonConnectUI } from "@tonconnect/ui-react";

import { useWithdrawalFeeParams } from "../hooks/use-withdrawal-params";

export const ClaimWithdrawalFeeButton: React.FC<
  ButtonProps & { routerAddress: string; tokenMinters: string[] }
> = ({ routerAddress, tokenMinters, ...props }) => {
  const withdrawalParamsQuery = useWithdrawalFeeParams({
    routerAddress,
    tokenMinters,
  });

  const [tonConnectUI] = useTonConnectUI();
  const [isLoading, setIsLoading] = useState(false);

  const handleClaim: ButtonProps["onClick"] = async (event) => {
    if (props.onClick) {
      props.onClick(event);
    }

    if (!withdrawalParamsQuery.data) {
      return;
    }

    setIsLoading(true);

    try {
      await tonConnectUI.sendTransaction({
        validUntil: Date.now() + 1000000,
        messages: withdrawalParamsQuery.data,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClaim}
      disabled={props.disabled || isLoading || !withdrawalParamsQuery.data}
    />
  );
};
