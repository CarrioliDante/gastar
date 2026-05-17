"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";

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
