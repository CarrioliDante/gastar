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

export function useNumberInput({ value, onChange, currency = "USD", decimals = 0 }: UseNumberInputOpts) {
  const inputRef = useRef<HTMLInputElement>(null);
  const locale = CURRENCY_LOCALE[currency] ?? "en-US";

  const decimalSep =
    new Intl.NumberFormat(locale).formatToParts(1.1).find(p => p.type === "decimal")?.value ?? ".";

  // Normalize locale decimal sep → "." for parseFloat
  const normalize = useCallback(
    (raw: string) => (decimalSep !== "." ? raw.replace(decimalSep, ".") : raw),
    [decimalSep],
  );

  const format = useCallback(
    (raw: string): string => {
      const n = parseFloat(normalize(raw));
      if (isNaN(n)) return raw || "";
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      }).format(n);
    },
    [locale, decimals, normalize],
  );

  // Strip anything that isn't a digit, minus, or the locale's decimal separator.
  // Deduplicate decimal separators — only the first one is kept.
  const strip = useCallback(
    (s: string): string => {
      const allowed = new Set([..."0123456789-", decimalSep]);
      let seenDec = false;
      return [...s]
        .filter(c => {
          if (!allowed.has(c)) return false;
          if (c === decimalSep) {
            if (seenDec) return false;
            seenDec = true;
          }
          return true;
        })
        .join("");
    },
    [decimalSep],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(strip(e.target.value));
    },
    [strip, onChange],
  );

  // On blur, trim a trailing decimal separator so "100," → "100"
  const handleBlur = useCallback(() => {
    if (!value) return;
    if (value.endsWith(decimalSep)) {
      onChange(value.slice(0, -1));
    }
  }, [value, decimalSep, onChange]);

  // While typing, preserve the decimal portion verbatim so the cursor doesn't jump.
  // Only the integer part gets thousand-separator formatting.
  const display = (() => {
    if (!value) return "";
    const sepIdx = value.indexOf(decimalSep);
    if (sepIdx !== -1) {
      const intRaw = value.slice(0, sepIdx);
      const decRaw = value.slice(sepIdx + 1);
      const n = parseFloat(intRaw || "0");
      const formattedInt = isNaN(n)
        ? intRaw
        : new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
      return formattedInt + decimalSep + decRaw;
    }
    return format(value);
  })();

  const numericValue = value ? parseFloat(normalize(value)) || 0 : 0;

  return {
    display,
    raw: value,
    numericValue,
    handleChange,
    handleBlur,
    ref: inputRef,
  };
}
