"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";

export async function createGoal(formData: FormData) {
  const user = await requireUser();
  const name          = formData.get("name") as string;
  const targetAmount  = parseFloat(formData.get("targetAmount") as string);
  const currentAmount = parseFloat(formData.get("currentAmount") as string) || 0;
  const deadlineStr   = formData.get("deadline") as string;

  if (!name || isNaN(targetAmount)) return;

  try {
    await db.savingsGoal.create({
      data: {
        userId: user.id, name, targetAmount,
        currentAmount: isNaN(currentAmount) ? 0 : currentAmount,
        deadline: deadlineStr ? new Date(deadlineStr) : null,
      },
    });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("createGoal failed:", err);
    throw err;
  }
}

export async function contributeToGoal(formData: FormData) {
  const user   = await requireUser();
  const id     = formData.get("id") as string;
  const amount = parseFloat(formData.get("amount") as string);

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
