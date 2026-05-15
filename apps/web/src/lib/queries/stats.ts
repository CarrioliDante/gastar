import { cache } from "react";
import "server-only";
import { db } from "@/lib/db";
import type { SpendingPoint, Category, BalanceData, MonthlyStats } from "@gastar/shared";

export const getDashboardStats = cache(async (userId: string) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const twentyFourMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 23, 1);

  const [balanceAgg, monthlyTransactions, trendTransactions, allTransactions24mo] = await Promise.all([
    db.transaction.aggregate({ where: { userId }, _sum: { amount: true } }),
    db.transaction.findMany({
      where: { userId, date: { gte: startOfMonth } },
      select: { amount: true, category: true },
    }),
    db.transaction.findMany({
      where: { userId, date: { gte: sixMonthsAgo }, amount: { lt: 0 } },
      select: { amount: true, date: true },
      orderBy: { date: "asc" },
    }),
    db.transaction.findMany({
      where: { userId, date: { gte: twentyFourMonthsAgo } },
      select: { amount: true, date: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const totalBalance = Number(balanceAgg._sum.amount ?? 0);
  const monthIncome   = monthlyTransactions.filter(t => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0);
  const monthSpending = monthlyTransactions.filter(t => Number(t.amount) < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  const trendMap = new Map<string, number>();
  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    trendMap.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
  }
  for (const t of trendTransactions) {
    const key = `${t.date.getFullYear()}-${t.date.getMonth()}`;
    if (trendMap.has(key)) trendMap.set(key, (trendMap.get(key) ?? 0) + Math.abs(Number(t.amount)));
  }
  const spendingTrend: SpendingPoint[] = Array.from(trendMap.entries()).map(([key, amount]) => {
    const [, month] = key.split("-").map(Number);
    return { month: monthLabels[month], amount: Math.round(amount) };
  });

  const catMap = new Map<string, number>();
  for (const t of monthlyTransactions.filter(t => Number(t.amount) < 0)) {
    catMap.set(t.category, (catMap.get(t.category) ?? 0) + Math.abs(Number(t.amount)));
  }
  const categories: Category[] = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({
      name, amount: Math.round(amount),
      percent: monthSpending > 0 ? Math.round((amount / monthSpending) * 100) : 0,
    }));

  const monthlyNetMap = new Map<string, number>();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyNetMap.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
  }
  for (const t of allTransactions24mo) {
    const key = `${t.date.getFullYear()}-${t.date.getMonth()}`;
    if (monthlyNetMap.has(key)) {
      monthlyNetMap.set(key, (monthlyNetMap.get(key) ?? 0) + Number(t.amount));
    }
  }
  let running = 0;
  const netWorth24mo: number[] = Array.from(monthlyNetMap.values()).map(v => {
    running += v;
    return Math.round(running);
  });

  return {
    balance: { total: totalBalance, currency: "USD", change: 0 } as BalanceData,
    monthly: {
      income:      Math.round(monthIncome),
      spending:    Math.round(monthSpending),
      savings:     Math.round(monthIncome - monthSpending),
      savingsGoal: 5000,
    } as MonthlyStats,
    spendingTrend,
    categories,
    netWorth24mo,
  };
});
