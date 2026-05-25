"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { parseNumeric } from "@/lib/parse-numeric";

const FREQ_DAYS: Record<string, number> = {
  weekly: 7, monthly: 30, bimonthly: 60, yearly: 365,
};

function nextOccurrenceOfDay(dayOfMonth: number): Date {
  const now = new Date();
  let d = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
  if (d <= now) d = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
  return d;
}

function advanceByMonth(from: Date, dayOfMonth: number): Date {
  return new Date(from.getFullYear(), from.getMonth() + 1, dayOfMonth);
}

export async function createRecurring(formData: FormData) {
  const user = await requireUser();
  const name       = formData.get("name") as string;
  const icon       = (formData.get("icon") as string) || "CreditCard";
  const amount     = parseNumeric(formData.get("amount"));
  const category   = formData.get("category") as string;
  const frequency  = (formData.get("frequency") as string) || "monthly";
  const note       = (formData.get("note") as string) || null;
  const dayRaw     = formData.get("dayOfMonth") as string;
  const dayOfMonth = dayRaw ? parseInt(dayRaw) : null;

  if (!name || isNaN(amount)) throw new Error("El nombre y el importe son obligatorios");

  let nextDueDate: Date;
  if (dayOfMonth && frequency === "monthly") {
    nextDueDate = nextOccurrenceOfDay(dayOfMonth);
  } else {
    nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + (FREQ_DAYS[frequency] ?? 30));
  }

  try {
    await db.recurringExpense.create({
      data: { userId: user.id, name, icon, amount, category, frequency, dayOfMonth, nextDueDate, note },
    });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("createRecurring failed:", err);
    throw err;
  }
}

export async function markRecurringPaid(id: string) {
  const user = await requireUser();
  const rec = await db.recurringExpense.findFirst({ where: { id, userId: user.id } });
  if (!rec) return;

  let next: Date;
  if (rec.dayOfMonth && rec.frequency === "monthly") {
    next = advanceByMonth(rec.nextDueDate, rec.dayOfMonth);
  } else {
    const days = FREQ_DAYS[rec.frequency] ?? 30;
    next = new Date(rec.nextDueDate);
    next.setDate(next.getDate() + days);
  }

  try {
    await Promise.all([
      db.transaction.create({
        data: {
          userId: user.id, name: rec.name,
          amount: -Math.abs(Number(rec.amount)),
          category: rec.category,
          note: `Recurrente · ${rec.frequency}`,
          blockId: rec.blockId,
        },
      }),
      db.recurringExpense.update({ where: { id }, data: { nextDueDate: next, lastPaidAt: new Date() } }),
    ]);
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("markRecurringPaid failed:", err);
    throw err;
  }
}

export async function toggleRecurringPause(id: string) {
  const user = await requireUser();
  const rec = await db.recurringExpense.findFirst({ where: { id, userId: user.id }, select: { pausedAt: true } });
  if (!rec) throw new Error("Gasto recurrente no encontrado");

  try {
    await db.recurringExpense.update({
      where: { id },
      data: { pausedAt: rec.pausedAt ? null : new Date() },
    });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("toggleRecurringPause failed:", err);
    throw err;
  }
}

export async function updateRecurring(id: string, data: {
  name: string; amount: number; category: string; icon?: string;
  frequency: string; dayOfMonth: number | null; note: string | null;
}) {
  const user = await requireUser();
  const existing = await db.recurringExpense.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Gasto recurrente no encontrado");

  let nextDueDate: Date;
  if (data.dayOfMonth && data.frequency === "monthly") {
    nextDueDate = nextOccurrenceOfDay(data.dayOfMonth);
  } else {
    const days = FREQ_DAYS[data.frequency] ?? 30;
    nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + days);
  }

  try {
    await db.recurringExpense.update({
      where: { id },
      data: {
        name: data.name,
        amount: data.amount,
        category: data.category,
        ...(data.icon !== undefined && { icon: data.icon }),
        frequency: data.frequency,
        dayOfMonth: data.dayOfMonth,
        note: data.note,
        nextDueDate,
      },
    });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("updateRecurring failed:", err);
    throw err;
  }
}

export async function deleteRecurring(id: string) {
  const user = await requireUser();
  try {
    await db.recurringExpense.deleteMany({ where: { id, userId: user.id } });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("deleteRecurring failed:", err);
    throw err;
  }
}
