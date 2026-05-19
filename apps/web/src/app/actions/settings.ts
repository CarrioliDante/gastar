"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

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

export async function dismissZenDigest() {
  const user = await requireUser();
  const today = new Date().toISOString().slice(0, 10);
  await db.userSetting.upsert({
    where: { userId_key: { userId: user.id, key: "zenDigestDate" } },
    update: { value: today },
    create: { userId: user.id, key: "zenDigestDate", value: today },
  });
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
