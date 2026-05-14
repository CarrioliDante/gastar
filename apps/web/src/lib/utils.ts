import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Server-safe formatter — always USD, used in Server Components
export const fmt = {
  currency: (n: number, compact = false, currency = "USD") =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 1 : 0,
    }).format(n),

  percent: (n: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "percent",
      maximumFractionDigits: 1,
    }).format(n / 100),

  date: (d: Date | string) =>
    new Intl.DateTimeFormat("es-AR", {
      weekday: "long", month: "long", day: "numeric",
    }).format(typeof d === "string" ? new Date(d) : d),
};
