import { cache } from "react";
import "server-only";
import { db } from "@/lib/db";

export async function getTransactionsByBlock(blockId: string, userId: string) {
  const rows = await db.transaction.findMany({
    where: { blockId, userId },
    orderBy: { date: "desc" },
    take: 30,
    select: { id: true, name: true, category: true, amount: true, date: true, note: true },
  });

  return rows.map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    amount: Number(t.amount),
    date: t.date.toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
    note: t.note ?? undefined,
  }));
}

export const getArchivedBlocks = cache(async (userId: string) => {
  const rows = await db.block.findMany({
    where: { userId, archivedAt: { not: null } },
    orderBy: { archivedAt: "desc" },
  });

  return rows.map(b => ({
    id: b.id, name: b.name, icon: b.icon,
    budget: Number(b.budget),
    spent: 0,
    color: b.color,
    expenses: 0,
    goal: b.goal ?? "",
  }));
});

export type BlockTransactionRow = Awaited<ReturnType<typeof getTransactionsByBlock>>[number];

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
