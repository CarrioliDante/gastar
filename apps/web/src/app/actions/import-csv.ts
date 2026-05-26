"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";

export interface CsvRow {
  name: string;
  amount: number;
  date: string; // ISO string
  category: string;
}

export async function importCsvTransactions(rows: CsvRow[]): Promise<{ imported: number; skipped: number }> {
  const user = await requireUser();

  if (!rows.length) return { imported: 0, skipped: 0 };
  if (rows.length > 500) throw new Error("Máximo 500 filas por importación");

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Fetch existing transactions in the same window for dedup
  const existing = await db.transaction.findMany({
    where: { userId: user.id, date: { gte: oneYearAgo } },
    select: { name: true, amount: true, date: true },
  });

  const existingSet = new Set(
    existing.map((t) => `${t.name}|${Number(t.amount).toFixed(2)}|${new Date(t.date).toISOString().slice(0, 10)}`)
  );

  const toInsert = rows.filter((r) => {
    const key = `${r.name}|${r.amount.toFixed(2)}|${r.date.slice(0, 10)}`;
    return !existingSet.has(key);
  });

  if (toInsert.length === 0) return { imported: 0, skipped: rows.length };

  await db.transaction.createMany({
    data: toInsert.map((r) => ({
      userId: user.id,
      name: r.name,
      amount: r.amount,
      category: r.category,
      date: new Date(r.date),
    })),
  });

  revalidateTag(`user:${user.id}`, "default");

  return { imported: toInsert.length, skipped: rows.length - toInsert.length };
}
