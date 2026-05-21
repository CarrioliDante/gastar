import { requireUser } from "@/lib/dal";
import { getDashboardStats } from "@/lib/queries/stats";
import { getAllTransactions } from "@/lib/queries/transactions";
import { getSavingsGoals } from "@/lib/queries/goals";
import { InsightsClient } from "./insights-client";

export default async function InsightsPage() {
  const user = await requireUser();
  const [stats, transactions, savingsGoals] = await Promise.all([
    getDashboardStats(user.id),
    getAllTransactions(user.id),
    getSavingsGoals(user.id),
  ]);

  const { weekStats } = stats;

  // Patrimonio neto = balance total + ahorro acumulado en metas
  const savingsTotal = savingsGoals.reduce((s, g) => s + g.currentAmount, 0);
  const patrimonioNeto = stats.balance.total + savingsTotal;

  // Gasto diario del mes actual
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const dailySpendingMap = new Map<number, number>();
  for (const t of transactions) {
    const isoDate = (t as any).isoDate as string | undefined;
    if (!isoDate) continue;
    const d = new Date(isoDate + "T00:00:00");
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.amount < 0) {
      const day = d.getDate();
      dailySpendingMap.set(day, (dailySpendingMap.get(day) ?? 0) + Math.abs(t.amount));
    }
  }

  const dailySeries = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return { day, amount: Math.round(dailySpendingMap.get(day) ?? 0) };
  });

  return (
    <InsightsClient
      monthly={stats.monthly}
      categories={stats.categories}
      transactions={transactions}
      weekStats={weekStats}
      patrimonioNeto={patrimonioNeto}
      dailySeries={dailySeries}
    />
  );
}
