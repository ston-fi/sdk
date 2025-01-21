import { createContext, useReducer, useContext, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTonAddress } from "@tonconnect/ui-react";

const URL_PARAMS = {
  WALLET_ADDRESS: "ref_address",
  POOL_ADDRESS: "pool_address",
} as const;

type VaultClaimParams = {
  walletAddress: string;
  poolAddress: string;
};

type Action =
  | {
      type: "SET_WALLET_ADDRESS";
      payload: VaultClaimParams["walletAddress"];
    }
  | {
      type: "SET_POOL_ADDRESS";
      payload: VaultClaimParams["poolAddress"];
    };

const VaultClaimParamsContext = createContext<VaultClaimParams>({
  walletAddress: "",
  poolAddress: "",
});

const VaultClaimParamsContextDispatch = createContext<React.Dispatch<Action>>(
  () => {
    throw new Error(
      "Cannot use VaultClaimParamsDispatch outside of VaultClaimParamsProvider",
    );
  },
);

const vaultClaimParamsReducer = (
  state: VaultClaimParams,
  action: Action,
): VaultClaimParams => {
  if (action.type === "SET_WALLET_ADDRESS") {
    return { ...state, walletAddress: action.payload };
  }

  if (action.type === "SET_POOL_ADDRESS") {
    return { ...state, poolAddress: action.payload };
  }

  return state;
};

export const VaultClaimParamsProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const walletAddress = useTonAddress();

  const [state, dispatch] = useReducer(vaultClaimParamsReducer, {
    walletAddress:
      searchParams.get(URL_PARAMS.WALLET_ADDRESS) ?? walletAddress ?? "",
    poolAddress: searchParams.get(URL_PARAMS.POOL_ADDRESS) ?? "",
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (state.walletAddress)
      params.set(URL_PARAMS.WALLET_ADDRESS, state.walletAddress);
    if (state.poolAddress)
      params.set(URL_PARAMS.POOL_ADDRESS, state.poolAddress);

    const search = params.toString();
    const newUrl = `${pathname}${search ? `?${search}` : ""}`;

    router.replace(newUrl, { scroll: false });
  }, [state, pathname, router]);

  return (
    <VaultClaimParamsContext.Provider value={state}>
      <VaultClaimParamsContextDispatch.Provider value={dispatch}>
        {children}
      </VaultClaimParamsContextDispatch.Provider>
    </VaultClaimParamsContext.Provider>
  );
};

export const useVaultClaimParams = () => {
  const context = useContext(VaultClaimParamsContext);

  if (context === undefined) {
    throw new Error(
      "useVaultClaimParams must be used within a VaultClaimParamsProvider",
    );
  }

  return context;
};

export const useVaultClaimParamsDispatch = () => {
  const dispatch = useContext(VaultClaimParamsContextDispatch);

  if (dispatch === undefined) {
    throw new Error(
      "useVaultClaimParamsDispatch must be used within a VaultClaimParamsProvider",
    );
  }

  return dispatch;
};
