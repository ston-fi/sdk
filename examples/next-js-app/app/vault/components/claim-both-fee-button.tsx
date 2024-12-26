import type { PoolInfo } from "@ston-fi/api";

import type { ButtonProps } from "@/components/ui/button";

import { useVaultQuery } from "../hooks/use-vault-query";
import { ClaimWithdrawalFeeButton } from "./claim-fee-button";

export const ClaimBothFeeButton: React.FC<ButtonProps & { pool: PoolInfo }> = ({
  pool,
  ...props
}) => {
  const vault0DataQuery = useVaultQuery({
    routerAddress: pool.routerAddress,
    tokenMinter: pool.token0Address,
  });

  const vault1DataQuery = useVaultQuery({
    routerAddress: pool.routerAddress,
    tokenMinter: pool.token1Address,
  });

  return (
    <ClaimWithdrawalFeeButton
      {...props}
      routerAddress={pool.routerAddress}
      tokenMinters={[pool.token0Address, pool.token1Address]}
      disabled={
        !vault0DataQuery.data || !vault1DataQuery.data || props.disabled
      }
    />
  );
};
