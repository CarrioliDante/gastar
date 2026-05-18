"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { parseNumeric } from "@/lib/parse-numeric";

export async function createBlock(formData: FormData) {
  const user = await requireUser();
  const name   = formData.get("name") as string;
  const icon   = (formData.get("icon") as string) || "◈";
  const budget = parseNumeric(formData.get("budget"));
  const goal   = (formData.get("goal") as string) || null;

  if (!name || isNaN(budget)) throw new Error("El nombre y el presupuesto son obligatorios");

  try {
    await db.block.create({ data: { userId: user.id, name, icon, budget, goal } });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("createBlock failed:", err);
    throw err;
  }
}

export async function updateBlock(id: string, formData: FormData) {
  const user = await requireUser();
  const name   = formData.get("name") as string;
  const icon   = formData.get("icon") as string;
  const budget = parseNumeric(formData.get("budget"));
  const goal   = (formData.get("goal") as string) || null;

  if (!name || isNaN(budget)) throw new Error("El nombre y el presupuesto son obligatorios");

  try {
    await db.block.updateMany({
      where: { id, userId: user.id },
      data: { name, icon, budget, goal },
    });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("updateBlock failed:", err);
    throw err;
  }
}

export async function archiveBlock(id: string) {
  const user = await requireUser();
  try {
    await db.block.updateMany({ where: { id, userId: user.id }, data: { archivedAt: new Date() } });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("archiveBlock failed:", err);
    throw err;
  }
}
