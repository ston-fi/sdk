"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer } from "react";

import { STAKE_MAX_DURATION_MONTH } from "../constants";

export type StakeFormState = {
  amount: bigint | undefined;
  durationMonths: number;
};

export type StakeFormAction =
  | { type: "SET_AMOUNT"; payload: StakeFormState["amount"] }
  | { type: "SET_DURATION_MONTHS"; payload: StakeFormState["durationMonths"] }
  | { type: "RESET_FORM" };

export type StakeFormContextType = {
  state: StakeFormState;
  setAmount: (amount: StakeFormState["amount"]) => void;
  setDurationMonths: (months: StakeFormState["durationMonths"]) => void;
  resetForm: () => void;
};

const initialState: StakeFormState = {
  amount: undefined,
  durationMonths: STAKE_MAX_DURATION_MONTH,
};

function stakeFormReducer(
  state: StakeFormState,
  action: StakeFormAction,
): StakeFormState {
  switch (action.type) {
    case "SET_AMOUNT":
      return {
        ...state,
        amount: action.payload,
      };
    case "SET_DURATION_MONTHS":
      return {
        ...state,
        durationMonths: action.payload,
      };
    case "RESET_FORM":
      return initialState;
    default:
      return state;
  }
}

const StakeFormContext = createContext<StakeFormContextType | undefined>(
  undefined,
);

export interface StakeFormProviderProps {
  children: ReactNode;
}

export function StakeFormProvider({ children }: StakeFormProviderProps) {
  const [state, dispatch] = useReducer(stakeFormReducer, initialState);

  const setAmount = (amount: StakeFormState["amount"]) => {
    dispatch({ type: "SET_AMOUNT", payload: amount });
  };

  const setDurationMonths = (months: StakeFormState["durationMonths"]) => {
    dispatch({ type: "SET_DURATION_MONTHS", payload: months });
  };

  const resetForm = () => {
    dispatch({ type: "RESET_FORM" });
  };

  const value: StakeFormContextType = {
    state,
    setAmount,
    setDurationMonths,
    resetForm,
  };

  return (
    <StakeFormContext.Provider value={value}>
      {children}
    </StakeFormContext.Provider>
  );
}

export function useStakeForm(): StakeFormContextType {
  const context = useContext(StakeFormContext);

  if (context === undefined) {
    throw new Error("useStakeForm must be used within a StakeFormProvider");
  }

  return context;
}
