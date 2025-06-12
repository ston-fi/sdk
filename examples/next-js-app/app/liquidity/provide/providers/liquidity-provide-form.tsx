"use client";

import { LiquidityProvisionType, type PoolInfo } from "@ston-fi/api";
import {
  type Dispatch,
  type ReactNode,
  createContext,
  useContext,
  useReducer,
} from "react";

import type { AssetInfo } from "@/hooks/use-assets-query";

export { LiquidityProvisionType } from "@ston-fi/api";

type LiquidityProvideState = {
  assetA: AssetInfo | null;
  assetB: AssetInfo | null;
  assetAUnits: string;
  assetBUnits: string;
  provisionType: Exclude<LiquidityProvisionType, "Initial">;
  pool: PoolInfo | null;
};

const initialState: LiquidityProvideState = {
  assetA: null,
  assetB: null,
  assetAUnits: "",
  assetBUnits: "",
  provisionType: LiquidityProvisionType.Balanced,
  pool: null,
};

type IAction =
  | {
      type: "SET_ASSET_A" | "SET_ASSET_B";
      payload: AssetInfo | null;
    }
  | {
      type: "SET_ASSET_A_AMOUNT" | "SET_ASSET_B_AMOUNT";
      payload: string;
    }
  | {
      type: "SET_POOL";
      payload: LiquidityProvideState["pool"];
    }
  | {
      type: "SET_PROVISION_TYPE";
      payload: LiquidityProvideState["provisionType"];
    };

const LiquidityProvideContext =
  createContext<LiquidityProvideState>(initialState);
const LiquidityProvideContextDispatch = createContext<Dispatch<IAction>>(
  () => {},
);

const swapReducer = (
  state: LiquidityProvideState,
  action: IAction,
): LiquidityProvideState => {
  if (action.type === "SET_ASSET_A") {
    const shouldReset =
      state.assetB?.contractAddress === action.payload?.contractAddress;

    return {
      ...state,
      assetA: action.payload,
      assetB: shouldReset ? null : state.assetB,
      assetBUnits: shouldReset ? "" : state.assetBUnits,
      pool: null,
    };
  }

  if (action.type === "SET_ASSET_B") {
    return { ...state, assetB: action.payload, pool: null };
  }

  if (action.type === "SET_ASSET_A_AMOUNT") {
    return {
      ...state,
      assetAUnits: action.payload,
      assetBUnits:
        state.provisionType === LiquidityProvisionType.Arbitrary
          ? state.assetBUnits
          : "",
    };
  }

  if (action.type === "SET_ASSET_B_AMOUNT") {
    return {
      ...state,
      assetBUnits: action.payload,
      assetAUnits:
        state.provisionType === LiquidityProvisionType.Arbitrary
          ? state.assetAUnits
          : "",
    };
  }

  if (action.type === "SET_POOL") {
    return {
      ...state,
      pool: action.payload,
      provisionType: initialState.provisionType,
    };
  }

  if (action.type === "SET_PROVISION_TYPE") {
    return {
      ...state,
      provisionType: action.payload,
      assetAUnits: "",
      assetBUnits: "",
    };
  }

  return state;
};

export const LiquidityFormProvider = ({
  children,
}: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(swapReducer, initialState);

  return (
    <LiquidityProvideContext.Provider value={state}>
      <LiquidityProvideContextDispatch.Provider value={dispatch}>
        {children}
      </LiquidityProvideContextDispatch.Provider>
    </LiquidityProvideContext.Provider>
  );
};

export const useLiquidityProvideForm = () =>
  useContext(LiquidityProvideContext);
export const useLiquidityProvideFormDispatch = () =>
  useContext(LiquidityProvideContextDispatch);
