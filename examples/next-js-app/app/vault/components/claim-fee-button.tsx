import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useTonConnectUI } from "@tonconnect/ui-react";

import { buildVaultWithdrawalFeeTx } from "../actions/build-vault-withdrawal-fee-tx";
import { useVaultClaimParams } from "../providers/vault-claim-params";

export const ClaimWithdrawalFeeButton: React.FC<
  ButtonProps & { routerAddress: string; assetAddress: string }
> = ({ routerAddress, assetAddress, ...props }) => {
  const { walletAddress: userWalletAddress } = useVaultClaimParams();

  const [tonConnectUI] = useTonConnectUI();
  const [isLoading, setIsLoading] = useState(false);

  const handleClaim: ButtonProps["onClick"] = async (event) => {
    if (props.onClick) {
      props.onClick(event);
    }

    setIsLoading(true);

    try {
      const withdrawalFeeTxParams = await buildVaultWithdrawalFeeTx([
        {
          routerAddress,
          userWalletAddress,
          tokenMinter: assetAddress,
        },
      ]);

      await tonConnectUI.sendTransaction({
        validUntil: Date.now() + 1000000,
        messages: withdrawalFeeTxParams,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClaim}
      disabled={props.disabled || isLoading}
    />
  );
};
