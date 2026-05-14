"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";

export async function createBlock(formData: FormData) {
  const user = await requireUser();
  const name   = formData.get("name") as string;
  const icon   = (formData.get("icon") as string) || "◈";
  const budget = parseFloat(formData.get("budget") as string);
  const goal   = (formData.get("goal") as string) || null;

  if (!name || isNaN(budget)) return;
  await db.block.create({ data: { userId: user.id, name, icon, budget, goal } });
  revalidateTag(`user:${user.id}`, "default");
}

export async function archiveBlock(id: string) {
  const user = await requireUser();
  await db.block.updateMany({ where: { id, userId: user.id }, data: { archivedAt: new Date() } });
  revalidateTag(`user:${user.id}`, "default");
}
