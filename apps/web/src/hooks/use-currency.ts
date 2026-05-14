"use client";

import { useTheme } from "@/components/providers/theme-provider";

export function useCurrency() {
  const { currency, currencySymbol } = useTheme();

  const format = (n: number, compact = false) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 1 : 0,
    }).format(n);

  return { currency, symbol: currencySymbol, format };
}
