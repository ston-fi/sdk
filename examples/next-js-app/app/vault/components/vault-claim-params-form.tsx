"use client";

import { AddressInput } from "@/components/address-input";
import { cn } from "@/lib/utils";

import { useVaultClaimParams, useVaultClaimParamsDispatch } from "../providers";

export const VaultClaimParamsForm: React.FC<
  Omit<React.ComponentPropsWithoutRef<"div">, "children">
> = (props) => {
  const { walletAddress } = useVaultClaimParams();
  const dispatch = useVaultClaimParamsDispatch();

  return (
    <div {...props} className={cn("flex flex-col gap-2", props.className)}>
      <AddressInput
        label="Referral address:"
        required
        address={walletAddress}
        onAddressChange={(address) =>
          dispatch({ type: "SET_WALLET_ADDRESS", payload: address })
        }
      />
    </div>
  );
};
