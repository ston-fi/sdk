"use client";

import { AddressInput } from "@/components/address-input";
import { Card, CardContent } from "@/components/ui/card";

import {
  useLiquidityRefundForm,
  useLiquidityRefundFormDispatch,
} from "../providers/liquidity-refund-form";

export const LiquidityRefundForm = (props: { className?: string }) => {
  const { routerAddress, lpAccountAddress } = useLiquidityRefundForm();
  const dispatch = useLiquidityRefundFormDispatch();

  return (
    <Card {...props}>
      <CardContent className="flex flex-col gap-4 p-6">
        <AddressInput
          label="Router address:"
          required
          address={routerAddress ?? ""}
          onAddressChange={(address) =>
            dispatch({ type: "SET_ROUTER_ADDRESS", payload: address })
          }
        />

        <AddressInput
          label="LP Account address:"
          required
          address={lpAccountAddress ?? ""}
          onAddressChange={(address) =>
            dispatch({ type: "SET_LP_ACCOUNT_ADDRESS", payload: address })
          }
        />
      </CardContent>
    </Card>
  );
};
