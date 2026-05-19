"use client";

import { useState } from "react";
import { useNumberInput } from "@/hooks/use-number-input";
import { useCurrency } from "@/hooks/use-currency";

interface Props {
  name?: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  decimals?: number;
}

export function AmountInput({ name, value: controlled, onChange, placeholder = "0", required, style, autoFocus, decimals = 2 }: Props) {
  const [internal, setInternal] = useState("");
  const { currency } = useCurrency();
  const isControlled = controlled !== undefined;
  const raw = isControlled ? controlled : internal;
  const handleRaw = isControlled ? (onChange ?? (() => {})) : setInternal;

  const num = useNumberInput({
    value: raw,
    onChange: handleRaw,
    currency,
    decimals,
  });

  return (
    <>
      {name && <input type="hidden" name={name} value={num.numericValue} />}
      <input
        ref={num.ref}
        value={num.display}
        onChange={num.handleChange}
        onBlur={num.handleBlur}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        style={style}
      />
    </>
  );
}
