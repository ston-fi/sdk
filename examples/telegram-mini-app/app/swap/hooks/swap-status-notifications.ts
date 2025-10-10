import { useEffect } from "react";

import { useToast } from "@/hooks/use-toast";

import { useSwapStatusQuery } from "./swap-status-query";

export const useSwapStatusNotifications = () => {
  const { toast } = useToast();
  const { data, isError } = useSwapStatusQuery();

  useEffect(() => {
    if (!isError) return;

    toast({ title: "Transaction status refetch has been failed!" });
  }, [isError, toast]);

  useEffect(() => {
    if (!data?.exitCode) return;

    toast({
      title:
        data.exitCode === "failed"
          ? "Transaction failed"
          : data.exitCode === "swap_ok"
            ? "Transaction has successfully finished"
            : "Transaction has finished with unknown status",
    });
  }, [data?.exitCode, toast]);
};
