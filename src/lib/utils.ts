import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fmt = {
  currency: (n: number, compact = false) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 1 : 0,
    }).format(n),

  percent: (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "percent",
      maximumFractionDigits: 1,
    }).format(n / 100),

  date: (d: Date | string) =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(typeof d === "string" ? new Date(d) : d),
};
