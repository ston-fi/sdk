"use client";

import { cn } from "@/lib/utils";
import { AddressInput } from "@/components/address-input";

import { useVaultClaimParams, useVaultClaimParamsDispatch } from "../providers";

export const VaultClaimParamsForm: React.FC<
  Omit<React.ComponentPropsWithoutRef<"div">, "children">
> = (props) => {
  const { poolAddress, walletAddress } = useVaultClaimParams();
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
      <AddressInput
        label="Pool address:"
        required
        address={poolAddress}
        onAddressChange={(address) =>
          dispatch({ type: "SET_POOL_ADDRESS", payload: address })
        }
      />
    </div>
  );
};
