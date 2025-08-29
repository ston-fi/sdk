"use client";

import type React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useLpAccountDataQuery } from "../hooks/use-lp-account-data-query";

const previewClassName = "p-1 text-xs rounded-md bg-muted overflow-auto";

export function LpAccountDataSection(
  props: Omit<React.ComponentProps<"div">, "children">,
) {
  const { isLoading, error, data } = useLpAccountDataQuery();

  if (isLoading) {
    return (
      <div {...props}>
        <Skeleton className={cn(previewClassName, "w-full h-[96px]")} />
      </div>
    );
  }

  if (error) {
    return (
      <div {...props}>
        <pre className={cn(previewClassName, "text-red-500")}>
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  if (data) {
    return (
      <div {...props}>
        <pre className={previewClassName}>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }
}
