"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";

export async function createGoal(formData: FormData) {
  const user = await requireUser();
  const name         = formData.get("name") as string;
  const targetAmount = parseFloat(formData.get("targetAmount") as string);
  const deadlineStr  = formData.get("deadline") as string;

  if (!name || isNaN(targetAmount)) return;

  await db.savingsGoal.create({
    data: { userId: user.id, name, targetAmount, deadline: deadlineStr ? new Date(deadlineStr) : null },
  });
  revalidateTag(`user:${user.id}`, "default");
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

  await Promise.all([
    db.savingsGoal.update({
      where: { id },
      data: { currentAmount: newAmount, completedAt: completed ? new Date() : null },
    }),
    db.transaction.create({
      data: { userId: user.id, name: `Ahorro · ${goal.name}`, amount: -amount, category: "Ahorro", note: `Aporte a meta: ${goal.name}` },
    }),
  ]);

  revalidateTag(`user:${user.id}`, "default");
}

export async function deleteGoal(id: string) {
  const user = await requireUser();
  await db.savingsGoal.deleteMany({ where: { id, userId: user.id } });
  revalidateTag(`user:${user.id}`, "default");
}
