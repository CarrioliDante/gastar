"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { parseNumeric } from "@/lib/parse-numeric";

export async function createGoal(formData: FormData) {
  const user = await requireUser();
  const name          = formData.get("name") as string;
  const targetAmount  = parseNumeric(formData.get("targetAmount"));
  const currentAmount = parseNumeric(formData.get("currentAmount")) || 0;
  const currency          = (formData.get("currency") as string) === "USD" ? "USD" : "ARS";
  const linkedToBalance   = formData.get("linkedToBalance") === "true" && currency === "USD";
  const deadlineStr       = formData.get("deadline") as string;

  if (!name || isNaN(targetAmount)) return;

  try {
    await db.savingsGoal.create({
      data: {
        userId: user.id, name, targetAmount,
        currentAmount: isNaN(currentAmount) ? 0 : currentAmount,
        currency, linkedToBalance,
        deadline: deadlineStr ? new Date(deadlineStr) : null,
      },
    });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("createGoal failed:", err);
    throw err;
  }
}

export async function updateSavingsGoal(
  id: string,
  data: {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    currency?: string;
    linkedToBalance?: boolean;
    deadline: string | null;
  },
) {
  const user = await requireUser();
  const goal = await db.savingsGoal.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!goal) throw new Error("Meta no encontrada");
  if (!data.name.trim()) throw new Error("El nombre es obligatorio");
  if (data.targetAmount <= 0) throw new Error("La meta debe ser mayor a cero");

  try {
    await db.savingsGoal.update({
      where: { id },
      data: {
        name: data.name.trim(),
        targetAmount: data.targetAmount,
        ...(data.currentAmount !== undefined && { currentAmount: data.currentAmount }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.linkedToBalance !== undefined && { linkedToBalance: data.linkedToBalance }),
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
    });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("updateSavingsGoal failed:", err);
    throw err;
  }
}

export async function contributeToGoal(formData: FormData) {
  const user   = await requireUser();
  const id     = formData.get("id") as string;
  const amount = parseNumeric(formData.get("amount"));

  if (!id || isNaN(amount) || amount <= 0) return;

  const goal = await db.savingsGoal.findFirst({ where: { id, userId: user.id } });
  if (!goal) return;

  const newAmount = Number(goal.currentAmount) + amount;
  const completed = newAmount >= Number(goal.targetAmount);

  try {
    await db.savingsGoal.update({
      where: { id },
      data: { currentAmount: newAmount, completedAt: completed ? new Date() : null },
    });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("contributeToGoal failed:", err);
    throw err;
  }
}

export async function deleteGoal(id: string) {
  const user = await requireUser();
  try {
    await db.savingsGoal.deleteMany({ where: { id, userId: user.id } });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("deleteGoal failed:", err);
    throw err;
  }
}
