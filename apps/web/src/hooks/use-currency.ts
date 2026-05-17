"use client";

import { useTheme } from "@/components/providers/theme-provider";

export function useCurrency() {
  const { currency, currencySymbol } = useTheme();

  const format = (n: number, compact = false) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      notation: compact ? "compact" : "standard",
      minimumFractionDigits: 0,
      maximumFractionDigits: compact ? 1 : 2,
    }).format(n);

  return { currency, symbol: currencySymbol, format };
}
