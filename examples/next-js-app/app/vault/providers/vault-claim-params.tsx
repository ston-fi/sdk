import { useTonAddress } from "@tonconnect/ui-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useReducer } from "react";

const URL_PARAMS = {
  WALLET_ADDRESS: "ref_address",
} as const;

type VaultClaimParams = {
  walletAddress: string;
};

type Action = {
  type: "SET_WALLET_ADDRESS";
  payload: VaultClaimParams["walletAddress"];
};

const VaultClaimParamsContext = createContext<VaultClaimParams>({
  walletAddress: "",
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

  return state;
};

export const VaultClaimParamsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const walletAddress = useTonAddress();

  const [state, dispatch] = useReducer(vaultClaimParamsReducer, {
    walletAddress:
      searchParams.get(URL_PARAMS.WALLET_ADDRESS) ?? walletAddress ?? "",
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (state.walletAddress)
      params.set(URL_PARAMS.WALLET_ADDRESS, state.walletAddress);

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
