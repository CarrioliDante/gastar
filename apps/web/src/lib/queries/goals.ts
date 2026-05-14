import "server-only";
import { db } from "@/lib/db";
import { userCache } from "@/lib/cache";

export function getSavingsGoals(userId: string) {
  return userCache(
    async () => {
      const rows = await db.savingsGoal.findMany({
        where: { userId, completedAt: null },
        orderBy: { createdAt: "asc" },
      });

      return rows.map(g => ({
        id: g.id, name: g.name,
        targetAmount: Number(g.targetAmount),
        currentAmount: Number(g.currentAmount),
        deadline: g.deadline?.toLocaleDateString("es-AR", { month: "short", year: "numeric" }) ?? null,
        pct: Number(g.targetAmount) > 0
          ? Math.min(100, Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100))
          : 0,
        remaining: Math.max(0, Number(g.targetAmount) - Number(g.currentAmount)),
      }));
    },
    userId,
    ["goals"],
  );
}

export type GoalRow = Awaited<ReturnType<typeof getSavingsGoals>>[number];
