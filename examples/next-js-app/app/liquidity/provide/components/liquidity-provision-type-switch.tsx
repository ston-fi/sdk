import { Switch } from "@/components/ui/switch";
import { useRouters } from "@/hooks/use-routers";
import { cn } from "@/lib/utils";
import { useId } from "react";

import {
  LiquidityProvisionType,
  useLiquidityProvideForm,
  useLiquidityProvideFormDispatch,
} from "../providers/liquidity-provide-form";

export const LiquidityProvisionTypeSwitch: React.FC<
  Omit<React.ComponentPropsWithoutRef<"div">, "children">
> = (props) => {
  const id = useId();
  const { data } = useRouters();
  const { pool, provisionType } = useLiquidityProvideForm();
  const dispatch = useLiquidityProvideFormDispatch();

  const router = pool?.routerAddress ? data?.get(pool.routerAddress) : null;

  return (
    <div
      {...props}
      className={cn("flex items-center space-x-1", props.className)}
    >
      <Switch
        id={id}
        checked={provisionType === LiquidityProvisionType.Arbitrary}
        onCheckedChange={(checked) =>
          dispatch({
            type: "SET_PROVISION_TYPE",
            payload: checked
              ? LiquidityProvisionType.Arbitrary
              : LiquidityProvisionType.Balanced,
          })
        }
        disabled={!router || router.majorVersion === 1}
      />
      <label htmlFor={id}>Arbitrary</label>
    </div>
  );
};
