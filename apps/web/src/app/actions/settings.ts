"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { saveCustomCategories } from "@/lib/custom-categories";

export async function setMonthlyBudget(formData: FormData) {
  const user = await requireUser();
  const raw = formData.get("budget");
  if (!raw) return { error: "Missing budget value" };
  const value = String(raw);

  await db.userSetting.upsert({
    where: { userId_key: { userId: user.id, key: "monthlyBudget" } },
    update: { value },
    create: { userId: user.id, key: "monthlyBudget", value },
  });

  revalidateTag(`user:${user.id}`, "default");
}

export async function updateCustomCategories(
  categories: { id: string; label: string; glyph: string; type: "expense" | "income" }[],
) {
  const user = await requireUser();
  await saveCustomCategories(user.id, categories);
  revalidateTag(`user:${user.id}`, "default");
}

export async function updateUserName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("El nombre no puede estar vacío");

  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { full_name: trimmed } });
  if (error) throw new Error(error.message);
}

export async function resetUserData() {
  const user = await requireUser();

  await db.$transaction([
    // DollarOperation cascades from Transaction (onDelete: Cascade)
    db.transaction.deleteMany({ where: { userId: user.id } }),
    db.block.deleteMany({ where: { userId: user.id } }),
    db.installment.deleteMany({ where: { userId: user.id } }),
    db.savingsGoal.deleteMany({ where: { userId: user.id } }),
    db.recurringExpense.deleteMany({ where: { userId: user.id } }),
  ]);

  revalidateTag(`user:${user.id}`, "default");
}
