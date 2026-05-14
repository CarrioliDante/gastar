import { requireUser } from "@/lib/dal";
import { getDashboardStats } from "@/lib/queries/stats";
import { getAllTransactions } from "@/lib/queries/transactions";
import { getActiveInstallments } from "@/lib/queries/installments";
import { InsightsClient } from "./insights-client";

function calcPulso(monthly: { income: number; spending: number; savings: number; savingsGoal: number }, installmentMonthly: number, txCount: number): {
  score: number;
  components: { label: string; value: number; weight: number }[];
  mood: string;
} {
  const savingsRate  = monthly.income > 0 ? Math.min(1, monthly.savings / monthly.income) : 0;
  const budgetAdherence = monthly.income > 0 ? Math.max(0, 1 - monthly.spending / (monthly.income * 0.8)) : 0;
  const dailyConsistency = Math.min(1, txCount / 20); // 20+ tx/month = full score
  const instHealth  = monthly.income > 0 ? Math.max(0, 1 - (installmentMonthly / monthly.income) * 3) : 1;

  const components = [
    { label: "Tasa de ahorro",       value: savingsRate,       weight: 0.35 },
    { label: "Adherencia presupuesto",value: budgetAdherence,  weight: 0.30 },
    { label: "Consistencia de registro", value: dailyConsistency, weight: 0.20 },
    { label: "Cuotas saludables",    value: instHealth,         weight: 0.15 },
  ];

  const score = Math.round(components.reduce((s, c) => s + c.value * c.weight, 0) * 100);

  const mood = score >= 80 ? "Excelente" : score >= 65 ? "Tranquilo" : score >= 45 ? "Atento" : "Bajo presión";

  return { score, components, mood };
}

export default async function InsightsPage() {
  const user = await requireUser();
  const [stats, transactions, installments] = await Promise.all([
    getDashboardStats(user.id),
    getAllTransactions(user.id),
    getActiveInstallments(user.id),
  ]);

  const installmentMonthly = installments.reduce((s, i) => s + i.monthly, 0);
  const pulso = calcPulso(stats.monthly, installmentMonthly, transactions.length);

  return (
    <InsightsClient
      monthly={stats.monthly}
      spendingTrend={stats.spendingTrend}
      categories={stats.categories}
      transactions={transactions}
      pulso={pulso}
    />
  );
}
