"use client";

import {
  type Dispatch,
  type ReactNode,
  createContext,
  useContext,
  useReducer,
} from "react";

import type { AssetInfo } from "@/hooks/use-assets-query";

type SwapState = {
  offerAsset: AssetInfo | null;
  askAsset: AssetInfo | null;
  offerAmount: string;
  askAmount: string;
  referralAddress?: string;
  referralValue?: number;
};

const initialState: SwapState = {
  offerAsset: null,
  askAsset: null,
  offerAmount: "",
  askAmount: "",
};

type IAction =
  | {
      type: "SET_OFFER_ASSET" | "SET_ASK_ASSET";
      payload: AssetInfo | null;
    }
  | {
      type: "SET_OFFER_AMOUNT" | "SET_ASK_AMOUNT";
      payload: string;
    }
  | { type: "SET_REFERRAL_ADDRESS"; payload: string | undefined }
  | { type: "SET_REFERRAL_VALUE"; payload: number | undefined };

const SwapContext = createContext<SwapState>(initialState);
const SwapContextDispatch = createContext<Dispatch<IAction>>(() => {});

const swapReducer = (state: SwapState, action: IAction): SwapState => {
  if (action.type === "SET_OFFER_ASSET") {
    const shouldResetAsk =
      state.askAsset?.contractAddress === action.payload?.contractAddress;

    return {
      ...state,
      offerAsset: action.payload,
      askAsset: shouldResetAsk ? null : state.askAsset,
      askAmount: shouldResetAsk ? "" : state.askAmount,
    };
  }

  if (action.type === "SET_ASK_ASSET") {
    return { ...state, askAsset: action.payload };
  }

  if (action.type === "SET_OFFER_AMOUNT") {
    return { ...state, offerAmount: action.payload, askAmount: "" };
  }

  if (action.type === "SET_ASK_AMOUNT") {
    return { ...state, askAmount: action.payload, offerAmount: "" };
  }

  if (action.type === "SET_REFERRAL_ADDRESS") {
    return { ...state, referralAddress: action.payload };
  }

  if (action.type === "SET_REFERRAL_VALUE") {
    return { ...state, referralValue: action.payload };
  }

  return state;
};

export const SwapFormProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(swapReducer, initialState);

  return (
    <SwapContext.Provider value={state}>
      <SwapContextDispatch.Provider value={dispatch}>
        {children}
      </SwapContextDispatch.Provider>
    </SwapContext.Provider>
  );
};

export const useSwapForm = () => useContext(SwapContext);
export const useSwapFormDispatch = () => useContext(SwapContextDispatch);
