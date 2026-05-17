"use client";

import { useCallback, useRef } from "react";
export { parseNumeric } from "@/lib/parse-numeric";

const CURRENCY_LOCALE: Record<string, string> = {
  USD: "en-US", // 1,000.00
  ARS: "es-AR", // 1.000,00
  BRL: "pt-BR", // 1.000,00
  EUR: "de-DE", // 1.000,00
};

interface UseNumberInputOpts {
  value: string;
  onChange: (raw: string) => void;
  /** Currency code (USD, ARS, BRL, EUR) — drives locale for thousand/decimal separators */
  currency?: string;
  decimals?: number;
}

/**
 * Number input that formats with currency-aware thousand/decimal separators.
 * USD → 1,000.00  |  ARS/BRL/EUR → 1.000,00
 * Formatted value lives inside the input at all times.
 */
export function useNumberInput({ value, onChange, currency = "USD", decimals = 0 }: UseNumberInputOpts) {
  const inputRef = useRef<HTMLInputElement>(null);
  const locale = CURRENCY_LOCALE[currency] ?? "en-US";

  const decimalSep =
    new Intl.NumberFormat(locale).formatToParts(1.1).find(p => p.type === "decimal")?.value ?? ".";

  const format = useCallback(
    (raw: string): string => {
      const n = parseFloat(raw);
      if (isNaN(n)) return raw || "";
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      }).format(n);
    },
    [locale, decimals],
  );

  // Strip any non-numeric character except minus and the locale's decimal separator
  const strip = useCallback(
    (s: string): string => {
      const allowed = new Set([..."0123456789-", decimalSep]);
      return [...s].filter(c => allowed.has(c)).join("");
    },
    [decimalSep],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = strip(e.target.value);
      onChange(raw);
    },
    [strip, onChange],
  );

  // Force formatted value into the DOM on blur (belt-and-suspenders with React controlled value)
  const handleBlur = useCallback(() => {
    if (!value) return;
    const formatted = format(value);
    if (inputRef.current && inputRef.current.value !== formatted) {
      inputRef.current.value = formatted;
    }
  }, [value, format]);

  const display = value ? format(value) : "";

  // Normalize raw value to a JS number (handles comma decimal separator)
  const numericValue = (() => {
    if (!value) return 0;
    let normalized = value;
    // If the decimal separator is not ".", replace it
    if (decimalSep !== ".") {
      normalized = normalized.replace(decimalSep, ".");
    }
    return parseFloat(normalized) || 0;
  })();

  return {
    display,
    raw: value,
    numericValue,
    handleChange,
    handleBlur,
    ref: inputRef,
  };
}
