"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { parseNumeric } from "@/lib/parse-numeric";

export async function createInstallment(formData: FormData) {
  const user = await requireUser();
  const name              = formData.get("name") as string;
  const totalAmount       = parseNumeric(formData.get("totalAmount"));
  const monthlyAmount     = parseNumeric(formData.get("monthlyAmount"));
  const totalInstallments = parseInt(formData.get("totalInstallments") as string);
  const paidInstallments  = Math.max(0, parseInt(formData.get("paidInstallments") as string) || 0);
  const nextDueDateStr    = formData.get("nextDueDate") as string;

  const startedAtStr = formData.get("startedAt") as string;

  if (!name || isNaN(totalAmount) || isNaN(monthlyAmount) || isNaN(totalInstallments)) throw new Error("Completá todos los campos obligatorios");

  const nextDueDate = nextDueDateStr ? new Date(nextDueDateStr) : new Date();

  // Use explicit start date if provided, otherwise backdate from next due date
  // by the number of already-paid installments
  const startedAt = startedAtStr
    ? new Date(startedAtStr)
    : (() => {
        const d = new Date(nextDueDate);
        d.setMonth(d.getMonth() - paidInstallments);
        return d;
      })();

  try {
    await db.installment.create({
      data: {
        userId: user.id, name,
        totalAmount, monthlyAmount, totalInstallments,
        paidInstallments,
        nextDueDate,
        startedAt,
      },
    });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("createInstallment failed:", err);
    throw err;
  }
}

export async function updateInstallment(
  id: string,
  data: { name: string; monthlyAmount: number; paidInstallments: number },
) {
  const user = await requireUser();
  const inst = await db.installment.findFirst({
    where: { id, userId: user.id },
    select: { totalInstallments: true },
  });
  if (!inst) throw new Error("Cuota no encontrada");

  const paid = Math.max(0, data.paidInstallments);
  if (paid >= inst.totalInstallments) throw new Error("Las cuotas pagadas no pueden igualar o superar el total");
  if (data.monthlyAmount <= 0) throw new Error("El importe mensual debe ser mayor a cero");

  try {
    await db.installment.update({
      where: { id },
      data: {
        name: data.name,
        monthlyAmount: data.monthlyAmount,
        paidInstallments: paid,
      },
    });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("updateInstallment failed:", err);
    throw err;
  }
}

export async function payInstallment(id: string) {
  const user = await requireUser();
  const inst = await db.installment.findFirst({ where: { id, userId: user.id } });
  if (!inst) return;

  const newPaid = inst.paidInstallments + 1;
  const completed = newPaid >= inst.totalInstallments;

  const next = new Date(inst.nextDueDate);
  next.setMonth(next.getMonth() + 1);

  try {
    await Promise.all([
      db.installment.update({
        where: { id },
        data: {
          paidInstallments: newPaid,
          nextDueDate: next,
          completedAt: completed ? new Date() : null,
        },
      }),
      db.transaction.create({
        data: {
          userId: user.id,
          name: `${inst.name} · cuota ${newPaid}/${inst.totalInstallments}`,
          amount: -Number(inst.monthlyAmount),
          category: "Cuotas",
          note: `Cuota ${newPaid} de ${inst.totalInstallments}`,
        },
      }),
    ]);
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("payInstallment failed:", err);
    throw err;
  }
}

export async function deleteInstallment(id: string) {
  const user = await requireUser();
  try {
    await db.installment.deleteMany({ where: { id, userId: user.id } });
    revalidateTag(`user:${user.id}`, "default");
  } catch (err) {
    console.error("deleteInstallment failed:", err);
    throw err;
  }
}
