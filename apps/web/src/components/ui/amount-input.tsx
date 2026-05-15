"use client";

import { useState } from "react";
import { useCurrency } from "@/hooks/use-currency";

interface Props {
  name?: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  style?: React.CSSProperties;
  autoFocus?: boolean;
}

export function AmountInput({ name, value: controlled, onChange, placeholder = "0", required, style, autoFocus }: Props) {
  const [internal, setInternal] = useState("");
  const { format } = useCurrency();

  const isControlled = controlled !== undefined;
  const raw = isControlled ? controlled : internal;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9.]/g, "");
    if (isControlled) onChange?.(v);
    else setInternal(v);
  };

  const n = parseFloat(raw || "0");

  return (
    <div>
      <input
        name={name}
        type="number"
        value={raw}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        style={style}
      />
      {n >= 1000 && (
        <div className="mono" style={{
          fontSize: 10, color: "var(--faint)",
          letterSpacing: "0.06em", marginTop: 4,
        }}>
          {format(n)}
        </div>
      )}
    </div>
  );
}
