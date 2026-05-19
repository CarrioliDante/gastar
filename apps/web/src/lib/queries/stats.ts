import { cache } from "react";
import "server-only";
import { db } from "@/lib/db";
import type { SpendingPoint, Category, BalanceData, MonthlyStats, TodayStats, WeekStats } from "@gastar/shared";

export const getDashboardStats = cache(async (userId: string) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const twentyFourMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 23, 1);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = now.getDay();
  const monday = new Date(startOfToday);
  monday.setDate(monday.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const [balanceAgg, monthlyTransactions, trendTransactions, allTransactions24mo, budgetSetting, todayTransactions, weekTransactions] = await Promise.all([
    db.transaction.aggregate({ where: { userId }, _sum: { amount: true } }),
    db.transaction.findMany({
      where: { userId, date: { gte: startOfMonth } },
      select: { amount: true, category: true },
    }),
    db.transaction.findMany({
      where: { userId, date: { gte: sixMonthsAgo } },
      select: { amount: true, date: true },
      orderBy: { date: "asc" },
    }),
    db.transaction.findMany({
      where: { userId, date: { gte: twentyFourMonthsAgo } },
      select: { amount: true, date: true },
      orderBy: { date: "asc" },
    }),
    db.userSetting.findUnique({
      where: { userId_key: { userId, key: "monthlyBudget" } },
      select: { value: true },
    }),
    db.transaction.findMany({
      where: { userId, date: { gte: startOfToday }, amount: { lt: 0 } },
      select: { amount: true, date: true },
    }),
    db.transaction.findMany({
      where: { userId, date: { gte: monday }, amount: { lt: 0 } },
      select: { amount: true, date: true },
    }),
  ]);

  const monthlyBudget = budgetSetting ? parseInt(budgetSetting.value, 10) || 5000 : 5000;

  const totalBalance = Number(balanceAgg._sum.amount ?? 0);
  const monthIncome   = monthlyTransactions.filter(t => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0);
  const monthSpending = monthlyTransactions.filter(t => Number(t.amount) < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  const spendingMap = new Map<string, number>();
  const incomeMap = new Map<string, number>();
  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    spendingMap.set(key, 0);
    incomeMap.set(key, 0);
  }
  for (const t of trendTransactions) {
    const key = `${t.date.getFullYear()}-${t.date.getMonth()}`;
    const amt = Number(t.amount);
    if (amt < 0 && spendingMap.has(key)) spendingMap.set(key, (spendingMap.get(key) ?? 0) + Math.abs(amt));
    if (amt > 0 && incomeMap.has(key)) incomeMap.set(key, (incomeMap.get(key) ?? 0) + amt);
  }
  const toTrend = (map: Map<string, number>): SpendingPoint[] =>
    Array.from(map.entries()).map(([key, amount]) => {
      const [, month] = key.split("-").map(Number);
      return { month: monthLabels[month], amount: Math.round(amount) };
    });
  const spendingTrend: SpendingPoint[] = toTrend(spendingMap);
  const incomeTrend: SpendingPoint[] = toTrend(incomeMap);

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

  // Today stats — bucket by 4h intervals
  const bucketDefs = [
    { label: "08:00", start: 0, end: 8 },
    { label: "12:00", start: 8, end: 12 },
    { label: "16:00", start: 12, end: 16 },
    { label: "20:00", start: 16, end: 20 },
    { label: "24:00", start: 20, end: 24 },
  ];
  const todayBuckets = bucketDefs.map(b => ({
    label: b.label,
    amount: todayTransactions
      .filter(t => t.date.getHours() >= b.start && t.date.getHours() < b.end)
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0),
  }));
  const todaySpending = todayTransactions.reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  // Week stats — daily spending Mon..Sun
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const dayMap = new Map<number, number>();
  for (const t of weekTransactions) {
    const d = t.date.getDay();
    dayMap.set(d, (dayMap.get(d) ?? 0) + Math.abs(Number(t.amount)));
  }
  const todayDay = now.getDay();
  const weekDaily = [1, 2, 3, 4, 5, 6, 0]
    .filter(d => {
      if (d === todayDay) return true;
      if (todayDay === 0) return d <= 6;
      return d <= todayDay && !(todayDay < 6 && d === 0);
    })
    .map(d => ({
      day: dayNames[d],
      amount: Math.round(dayMap.get(d) ?? 0),
    }));
  const weekSpending = weekTransactions.reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  return {
    balance: { total: totalBalance, currency: "USD", change: 0 } as BalanceData,
    monthly: {
      income:      Math.round(monthIncome),
      spending:    Math.round(monthSpending),
      savings:     Math.round(monthIncome - monthSpending),
      savingsGoal: monthlyBudget,
    } as MonthlyStats,
    spendingTrend,
    incomeTrend,
    categories,
    netWorth24mo,
    todayStats:  { spending: Math.round(todaySpending), buckets: todayBuckets } as TodayStats,
    weekStats:   { spending: Math.round(weekSpending), daily: weekDaily } as WeekStats,
  };
});
