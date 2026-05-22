import { cache } from "react";
import "server-only";
import { db } from "@/lib/db";

export interface DollarOperationRow {
  id: string;
  type: "BUY" | "SELL";
  usdAmount: number;
  arsAmount: number;
  rate: number;
  date: string;
  note: string | null;
}

export interface DollarData {
  totalUsd: number;
  avgCost: number;
  operations: DollarOperationRow[];
}

export const getDollarData = cache(async (userId: string): Promise<DollarData> => {
  const rows = await db.dollarOperation.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  let totalUsd = 0;
  let totalArsInvested = 0;
  let totalUsdBought = 0;

  const operations: DollarOperationRow[] = rows.map(op => {
    const usd = Number(op.usdAmount);
    const ars = Number(op.arsAmount);
    if (op.type === "BUY") {
      totalUsd += usd;
      totalArsInvested += ars;
      totalUsdBought += usd;
    } else {
      totalUsd -= usd;
      totalArsInvested -= ars;
    }
    return {
      id: op.id,
      type: op.type as "BUY" | "SELL",
      usdAmount: usd,
      arsAmount: ars,
      rate: Number(op.rate),
      date: op.date.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }),
      note: op.note ?? null,
    };
  });

  const avgCost = totalUsdBought > 0 ? totalArsInvested / totalUsdBought : 0;

  return {
    totalUsd: Math.round(totalUsd * 100) / 100,
    avgCost: Math.round(avgCost * 100) / 100,
    operations,
  };
});

export const getDollarBalance = cache(async (userId: string): Promise<number> => {
  const buys = await db.dollarOperation.aggregate({
    where: { userId, type: "BUY" },
    _sum: { usdAmount: true },
  });
  const sells = await db.dollarOperation.aggregate({
    where: { userId, type: "SELL" },
    _sum: { usdAmount: true },
  });
  return Math.round((Number(buys._sum.usdAmount ?? 0) - Number(sells._sum.usdAmount ?? 0)) * 100) / 100;
});
