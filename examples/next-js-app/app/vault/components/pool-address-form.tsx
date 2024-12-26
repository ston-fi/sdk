"use client";

import { useId, useState } from "react";

import { Input } from "@/components/ui/input";
import { TonAddressRegex } from "@/constants";
import { cn } from "@/lib/utils";

function validateAddress(address: unknown) {
  if (!address) {
    return new Error("Address is required");
  }

  if (typeof address !== "string") {
    return new Error("Address should be a string");
  }

  if (!TonAddressRegex.test(address)) {
    return new Error("Invalid address");
  }

  return null;
}

export default function PoolAddressForm({
  address,
  onAddressChange,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  address?: string;
  onAddressChange: (address: string) => void;
}) {
  const inputId = useId();

  const [inputValue, setInputValue] = useState(address);
  const [validationError, setValidationError] = useState<Error | null>(null);

  return (
    <div
      {...props}
      className={cn("grid w-full items-center gap-1", props.className)}
    >
      <label htmlFor={inputId}>Pool address</label>
      <Input
        id={inputId}
        type="text"
        value={inputValue}
        onChange={({ target }) => {
          const value = target.value;
          setInputValue(value);

          const error = value ? validateAddress(value) : null;
          setValidationError(error);
          onAddressChange(!error ? value : "");
        }}
        className="placeholder:text-secondary/1"
        placeholder="EQ…"
      />
      {validationError && (
        <p className="text-red-500">{validationError.message}</p>
      )}
    </div>
  );
}
