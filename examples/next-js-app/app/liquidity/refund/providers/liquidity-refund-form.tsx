"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";

const URL_PARAMS = {
  routerAddress: "router",
  lpAccountAddress: "lp_account",
} as const;

export type LiquidityRefundFormState = {
  routerAddress: string | undefined;
  lpAccountAddress: string | undefined;
};

type IAction =
  | {
      type: "SET_ROUTER_ADDRESS";
      payload: LiquidityRefundFormState["routerAddress"];
    }
  | {
      type: "SET_LP_ACCOUNT_ADDRESS";
      payload: LiquidityRefundFormState["lpAccountAddress"];
    };

const LiquidityRefundFormContext = createContext(
  {} as LiquidityRefundFormState,
);

const LiquidityRefundFormContextDispatch = createContext<Dispatch<IAction>>(
  () => {},
);

const reducer = (state: LiquidityRefundFormState, action: IAction) => {
  switch (action.type) {
    case "SET_ROUTER_ADDRESS":
      return { ...state, routerAddress: action.payload };
    case "SET_LP_ACCOUNT_ADDRESS":
      return { ...state, lpAccountAddress: action.payload };
    default:
      return state;
  }
};

export const LiquidityRefundFormProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [state, dispatch] = useReducer(reducer, {
    routerAddress: searchParams.get(URL_PARAMS.routerAddress) ?? undefined,
    lpAccountAddress:
      searchParams.get(URL_PARAMS.lpAccountAddress) ?? undefined,
  });

  useEffect(() => {
    const params = new URLSearchParams();

    if (state.routerAddress) {
      params.set(URL_PARAMS.routerAddress, state.routerAddress);
    } else {
      params.delete(URL_PARAMS.routerAddress);
    }

    if (state.lpAccountAddress) {
      params.set(URL_PARAMS.lpAccountAddress, state.lpAccountAddress);
    } else {
      params.delete(URL_PARAMS.lpAccountAddress);
    }

    const search = params.toString();
    const newUrl = `${pathname}${search ? `?${search}` : ""}`;

    router.replace(newUrl, { scroll: false });
  }, [state, pathname, router]);

  return (
    <LiquidityRefundFormContext.Provider value={state}>
      <LiquidityRefundFormContextDispatch.Provider value={dispatch}>
        {children}
      </LiquidityRefundFormContextDispatch.Provider>
    </LiquidityRefundFormContext.Provider>
  );
};

export const useLiquidityRefundForm = () =>
  useContext(LiquidityRefundFormContext);

export const useLiquidityRefundFormDispatch = () =>
  useContext(LiquidityRefundFormContextDispatch);
