"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { parseNumeric } from "@/lib/parse-numeric";

export async function createTransaction(formData: FormData) {
  const user = await requireUser();

  const name     = (formData.get("name") as string) || "Expense";
  const amount   = parseNumeric(formData.get("amount"));
  const currency = (formData.get("currency") as string) === "USD" ? "USD" : "ARS";
  const category = formData.get("category") as string;
  const note     = (formData.get("note") as string) || null;
  const blockId  = (formData.get("blockId") as string) || null;

  if (isNaN(amount) || !category) throw new Error("El monto y la categoría son obligatorios");

  // Validate blockId belongs to the user — silently unlink if not
  let resolvedBlockId = blockId || null;
  if (resolvedBlockId) {
    const block = await db.block.findFirst({ where: { id: resolvedBlockId, userId: user.id } });
    if (!block) resolvedBlockId = null;
  }

  try {
    await db.transaction.create({
      data: { userId: user.id, name, amount, currency, category, note, blockId: resolvedBlockId },
    });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("createTransaction failed:", err);
    throw err;
  }
}

export async function deleteTransaction(id: string) {
  const user = await requireUser();
  try {
    await db.transaction.deleteMany({ where: { id, userId: user.id } });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("deleteTransaction failed:", err);
    throw err;
  }
}
