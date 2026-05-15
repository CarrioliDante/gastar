import { cache } from "react";
import "server-only";
import { db } from "@/lib/db";

export const getBlocks = cache(async (userId: string) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const rows = await db.block.findMany({
    where: { userId, archivedAt: null },
    include: {
      transactions: { where: { date: { gte: startOfMonth } }, select: { amount: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return rows.map(b => ({
    id: b.id, name: b.name, icon: b.icon,
    budget: Number(b.budget),
    spent: b.transactions.reduce((s, t) => s + Math.abs(Number(t.amount)), 0),
    color: b.color,
    expenses: b.transactions.length,
    goal: b.goal ?? "",
  }));
});
