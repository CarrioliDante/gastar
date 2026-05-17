import { NextRequest, NextResponse } from 'next/server';
import { requireMobileAuth } from '../_auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;
  const now = new Date();
  const startOfMonth   = new Date(now.getFullYear(), now.getMonth(), 1);
  const twentyFourAgo  = new Date(now.getFullYear(), now.getMonth() - 23, 1);
  const sixMonthsAgo   = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [allTx, monthTx, trendTx, netWorthTx, budgetSetting] = await Promise.all([
    db.transaction.aggregate({ where: { userId }, _sum: { amount: true } }),
    db.transaction.findMany({
      where: { userId, date: { gte: startOfMonth } },
      select: { amount: true, category: true, date: true },
      orderBy: { date: 'asc' },
    }),
    db.transaction.findMany({
      where: { userId, date: { gte: sixMonthsAgo } },
      select: { amount: true, date: true },
      orderBy: { date: 'asc' },
    }),
    db.transaction.findMany({
      where: { userId, date: { gte: twentyFourAgo } },
      select: { amount: true, date: true },
      orderBy: { date: 'asc' },
    }),
    db.userSetting.findUnique({
      where: { userId_key: { userId, key: 'monthlyBudget' } },
      select: { value: true },
    }),
  ]);

  const monthlyBudget = budgetSetting ? parseInt(budgetSetting.value, 10) || 0 : 0;
  const balance       = Number(allTx._sum.amount ?? 0);
  const monthIncome   = monthTx.filter(t => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0);
  const monthSpend    = monthTx.filter(t => Number(t.amount) < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  // Daily spend series for current month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailySeries = Array.from({ length: daysInMonth }, () => 0);
  for (const t of monthTx) {
    if (Number(t.amount) < 0) {
      const day = new Date(t.date).getDate() - 1;
      if (day >= 0 && day < daysInMonth) dailySeries[day] += Math.abs(Number(t.amount));
    }
  }

  // Categories
  const catMap = new Map<string, number>();
  for (const t of monthTx.filter(t => Number(t.amount) < 0)) {
    catMap.set(t.category, (catMap.get(t.category) ?? 0) + Math.abs(Number(t.amount)));
  }
  const categories = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({
      name, amount: Math.round(amount),
      share: monthSpend > 0 ? amount / monthSpend : 0,
    }));

  // Net worth 24-month running sum
  const monthlyNetMap = new Map<string, number>();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyNetMap.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
  }
  for (const t of netWorthTx) {
    const key = `${t.date.getFullYear()}-${t.date.getMonth()}`;
    if (monthlyNetMap.has(key)) {
      monthlyNetMap.set(key, (monthlyNetMap.get(key) ?? 0) + Number(t.amount));
    }
  }
  let running = 0;
  const netWorth24mo = Array.from(monthlyNetMap.values()).map(v => {
    running += v;
    return Math.round(running);
  });

  // Pulso: 60% from savings ratio, 40% from budget adherence
  const savingsRatio  = monthIncome > 0 ? (monthIncome - monthSpend) / monthIncome : 0;
  const budgetRatio   = monthlyBudget > 0 ? 1 - monthSpend / monthlyBudget : 0;
  const pulso = Math.round(Math.max(0, Math.min(100,
    Math.max(0, savingsRatio) * 60 + Math.max(0, budgetRatio) * 40,
  )));

  return NextResponse.json({
    balance,
    monthly: {
      income:      Math.round(monthIncome),
      spending:    Math.round(monthSpend),
      budget:      monthlyBudget,
      available:   Math.round(monthlyBudget - monthSpend),
    },
    dailySeries,
    netWorth24mo,
    categories,
    pulso,
  });
}
