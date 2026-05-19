import { NextRequest, NextResponse } from 'next/server';
import { requireMobileAuth } from '../_auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;
  const now = new Date();
  const startOfMonth  = new Date(now.getFullYear(), now.getMonth(), 1);
  const twentyFourAgo = new Date(now.getFullYear(), now.getMonth() - 23, 1);

  // pre24moTx: aggregate of transactions older than the 24-month window (typically zero rows for new users)
  // netWorthTx: all transactions in the last 24 months (already needed for net-worth chart)
  // balance = pre24mo sum + sum(netWorthTx) — avoids a full-table aggregate with no date filter
  const [pre24moTx, monthTx, netWorthTx, budgetSetting] = await Promise.all([
    db.transaction.aggregate({
      where: { userId, date: { lt: twentyFourAgo } },
      _sum: { amount: true },
    }),
    db.transaction.findMany({
      where: { userId, date: { gte: startOfMonth } },
      select: { amount: true, category: true, date: true },
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
  const recentTotal   = netWorthTx.reduce((s, t) => s + Number(t.amount), 0);
  const balance       = Number(pre24moTx._sum.amount ?? 0) + recentTotal;
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

  // Today stats — bucket by 4h intervals
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayTx = await db.transaction.findMany({
    where: { userId, date: { gte: startOfToday }, amount: { lt: 0 } },
    select: { amount: true, date: true },
  });
  const bucketDefs = [
    { label: "08:00", start: 0, end: 8 },
    { label: "12:00", start: 8, end: 12 },
    { label: "16:00", start: 12, end: 16 },
    { label: "20:00", start: 16, end: 20 },
    { label: "24:00", start: 20, end: 24 },
  ];
  const todayBuckets = bucketDefs.map(b => {
    const amount = todayTx
      .filter(t => t.date.getHours() >= b.start && t.date.getHours() < b.end)
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    return { label: b.label, amount: Math.round(amount) };
  });
  const todaySpending = todayTx.reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  // Week stats — daily spending Mon..Sun
  const dayOfWeek = now.getDay();
  const monday = new Date(startOfToday);
  monday.setDate(monday.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const weekTx = await db.transaction.findMany({
    where: { userId, date: { gte: monday }, amount: { lt: 0 } },
    select: { amount: true, date: true },
  });
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const dayMap = new Map<number, number>();
  for (const t of weekTx) {
    const d = t.date.getDay();
    dayMap.set(d, (dayMap.get(d) ?? 0) + Math.abs(Number(t.amount)));
  }
  const todayDay = now.getDay();
  const weekDaily = [1, 2, 3, 4, 5, 6, 0]
    .filter(d => {
      // Only include days up to today
      if (d === todayDay) return true;
      if (todayDay === 0) return d <= 6; // Sunday: include all
      return d <= todayDay && !(todayDay < 6 && d === 0); // exclude future Sunday
    })
    .map(d => ({
      day: dayNames[d],
      amount: Math.round(dayMap.get(d) ?? 0),
    }));
  const weekSpending = weekTx.reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

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
    todayStats: { spending: Math.round(todaySpending), buckets: todayBuckets },
    weekStats:  { spending: Math.round(weekSpending), daily: weekDaily },
  });
}
