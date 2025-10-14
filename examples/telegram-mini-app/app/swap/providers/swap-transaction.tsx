"use client";

import type { QueryIdType } from "@ston-fi/sdk";
import { createContext, useContext, useState } from "react";

export interface ITransactionDetails {
  queryId: QueryIdType;
  routerAddress: string;
  ownerAddress: string;
}

const SwapTransactionContext = createContext<ITransactionDetails | null>(null);
const SetSwapTransactionContext = createContext<
  React.Dispatch<React.SetStateAction<ITransactionDetails | null>>
>(() => {});

export const useSwapTransactionDetails = () =>
  useContext(SwapTransactionContext);
export const useSetSwapTransactionDetails = () =>
  useContext(SetSwapTransactionContext);

export const SwapTransactionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [transaction, setTransaction] = useState<ITransactionDetails | null>(
    null,
  );

  return (
    <SwapTransactionContext.Provider value={transaction}>
      <SetSwapTransactionContext.Provider value={setTransaction}>
        {children}
      </SetSwapTransactionContext.Provider>
    </SwapTransactionContext.Provider>
  );
};
