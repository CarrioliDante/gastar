"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { parseNumeric } from "@/lib/parse-numeric";

export async function buyDollars(formData: FormData) {
  const user = await requireUser();

  const usdAmount = parseNumeric(formData.get("usdAmount"));
  const rate = parseNumeric(formData.get("rate"));
  const note = (formData.get("note") as string) || null;

  if (usdAmount <= 0) throw new Error("El monto en USD debe ser mayor a cero");
  if (rate <= 0) throw new Error("La cotización debe ser mayor a cero");

  const arsAmount = Math.round(usdAmount * rate * 100) / 100;

  try {
    await db.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          name: "Compra USD",
          amount: -arsAmount,
          category: "dolar",
          note: note ?? `Compra de USD ${usdAmount} a $${rate}`,
        },
      });

      await tx.dollarOperation.create({
        data: {
          userId: user.id,
          type: "BUY",
          usdAmount,
          arsAmount,
          rate,
          transactionId: transaction.id,
          note,
        },
      });
    });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("buyDollars failed:", err);
    throw err;
  }
}

export async function sellDollars(formData: FormData) {
  const user = await requireUser();

  const usdAmount = parseNumeric(formData.get("usdAmount"));
  const rate = parseNumeric(formData.get("rate"));
  const note = (formData.get("note") as string) || null;

  if (usdAmount <= 0) throw new Error("El monto en USD debe ser mayor a cero");
  if (rate <= 0) throw new Error("La cotización debe ser mayor a cero");

  // Check balance
  const buysAgg = await db.dollarOperation.aggregate({
    where: { userId: user.id, type: "BUY" },
    _sum: { usdAmount: true },
  });
  const sellsAgg = await db.dollarOperation.aggregate({
    where: { userId: user.id, type: "SELL" },
    _sum: { usdAmount: true },
  });
  const currentUsd = Number(buysAgg._sum.usdAmount ?? 0) - Number(sellsAgg._sum.usdAmount ?? 0);

  if (usdAmount > currentUsd) {
    throw new Error(`No tenés suficientes USD. Disponible: USD ${currentUsd.toFixed(2)}`);
  }

  const arsAmount = Math.round(usdAmount * rate * 100) / 100;

  try {
    await db.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          name: "Venta USD",
          amount: arsAmount,
          category: "dolar",
          note: note ?? `Venta de USD ${usdAmount} a $${rate}`,
        },
      });

      await tx.dollarOperation.create({
        data: {
          userId: user.id,
          type: "SELL",
          usdAmount,
          arsAmount,
          rate,
          transactionId: transaction.id,
          note,
        },
      });
    });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("sellDollars failed:", err);
    throw err;
  }
}
