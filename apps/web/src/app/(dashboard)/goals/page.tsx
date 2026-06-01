import { requireUser } from "@/lib/dal";
import { getSavingsGoals } from "@/lib/queries/goals";
import { getDollarBalance } from "@/lib/queries/dolar";
import { db } from "@/lib/db";
import { GoalsClient } from "./goals-client";

export default async function GoalsPage() {
  const user = await requireUser();
  const [goals, dolarOpsBalance, usdTxAgg] = await Promise.all([
    getSavingsGoals(user.id),
    getDollarBalance(user.id),
    db.transaction.aggregate({ where: { userId: user.id, currency: "USD" }, _sum: { amount: true } }),
  ]);
  const usdBalance = dolarOpsBalance + Number(usdTxAgg._sum.amount ?? 0);
  const resolvedGoals = goals.map(g => {
    if (g.currency === "USD" && g.linkedToBalance) {
      const current = usdBalance;
      const pct = g.targetAmount > 0 ? Math.min(100, Math.round((current / g.targetAmount) * 100)) : 0;
      return { ...g, currentAmount: current, pct, remaining: Math.max(0, g.targetAmount - current) };
    }
    return g;
  });
  return <GoalsClient initialGoals={resolvedGoals} usdBalance={usdBalance} />;
}
