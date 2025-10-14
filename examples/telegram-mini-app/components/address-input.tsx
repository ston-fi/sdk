"use client";

import { useCallback, useId, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { TonAddressRegex } from "@/constants";
import { cn } from "@/lib/utils";

function validateAddress(address: unknown, options: { required?: boolean }) {
  if (options.required && !address) {
    return new Error("Address is required");
  }

  if (!options.required && !address) {
    return null;
  }

  if (typeof address !== "string") {
    return new Error("Address should be a string");
  }

  if (!TonAddressRegex.test(address)) {
    return new Error("Invalid address");
  }

  return null;
}

interface AddressInputProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Input>,
    "value" | "onChange"
  > {
  label?: React.ReactNode;
  address: string;
  onAddressChange: (address: string) => void;
}

export function AddressInput({
  label,
  address,
  onAddressChange,
  required,
  ...props
}: AddressInputProps) {
  const fallbackId = useId();
  const inputId = props.id ?? fallbackId;

  const validationOptions = useMemo(() => ({ required }), [required]);

  const [inputValue, setInputValue] = useState(address);
  const [validationError, setValidationError] = useState(
    validateAddress(address, validationOptions),
  );

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const value = e.target.value;
      setInputValue(value);

      const error = validateAddress(value, validationOptions);
      setValidationError(error);
      onAddressChange(!error ? value : "");
    },
    [onAddressChange, validationOptions],
  );

  return (
    <div className={cn("grid w-full items-center gap-1", props.className)}>
      {label ? <label htmlFor={inputId}>{label}</label> : null}

      <Input
        placeholder="EQ…"
        type="text"
        {...props}
        className={cn(
          validationError && "border-red-500 focus-visible:ring-red-500",
        )}
        id={inputId}
        value={inputValue}
        onChange={handleChange}
        aria-invalid={!!validationError}
        aria-errormessage={validationError ? `${inputId}-error` : undefined}
      />

      {validationError ? (
        <p id={`${inputId}-error`} role="alert" className="text-red-500">
          {validationError.message}
        </p>
      ) : null}
    </div>
  );
}
