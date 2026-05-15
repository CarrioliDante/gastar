import { cache } from "react";
import "server-only";
import { db } from "@/lib/db";

export const getRecurringExpenses = cache(async (userId: string) => {
  const rows = await db.recurringExpense.findMany({
    where: { userId, pausedAt: null },
    orderBy: { nextDueDate: "asc" },
  });

  return rows.map(r => ({
    id: r.id, name: r.name,
    amount: Number(r.amount),
    category: r.category,
    frequency: r.frequency as "monthly" | "weekly" | "bimonthly" | "yearly",
    dayOfMonth: r.dayOfMonth ?? null,
    nextDueDate: r.nextDueDate.toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
    nextDueDateMs: r.nextDueDate.getTime(),
    blockId: r.blockId ?? undefined,
    note: r.note ?? undefined,
  }));
});

export type RecurringRow = Awaited<ReturnType<typeof getRecurringExpenses>>[number];
