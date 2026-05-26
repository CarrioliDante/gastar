"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { parseNumeric } from "@/lib/parse-numeric";

export async function createInstallment(formData: FormData) {
  const user = await requireUser();
  const name              = formData.get("name") as string;
  const category          = (formData.get("category") as string | null) || "Cuotas";
  const totalAmount       = parseNumeric(formData.get("totalAmount"));
  const monthlyAmount     = parseNumeric(formData.get("monthlyAmount"));
  const totalInstallments = parseInt(formData.get("totalInstallments") as string);
  const paidInstallments  = Math.max(0, parseInt(formData.get("paidInstallments") as string) || 0);
  const nextDueDateStr    = formData.get("nextDueDate") as string;
  const startedAtStr      = formData.get("startedAt") as string;

  if (!name || isNaN(totalAmount) || isNaN(monthlyAmount) || isNaN(totalInstallments)) throw new Error("Completá todos los campos obligatorios");

  // Determine startedAt: explicit > backdate from nextDueDate by already-paid count
  const startedAt = startedAtStr
    ? new Date(startedAtStr)
    : (() => {
        const d = nextDueDateStr ? new Date(nextDueDateStr) : new Date();
        if (paidInstallments > 0) d.setMonth(d.getMonth() - paidInstallments);
        return d;
      })();

  // Determine nextDueDate: explicit > startedAt + paidInstallments > today
  let nextDueDate: Date;
  if (nextDueDateStr) {
    nextDueDate = new Date(nextDueDateStr);
  } else {
    nextDueDate = new Date(startedAt);
    if (paidInstallments > 0) nextDueDate.setMonth(nextDueDate.getMonth() + paidInstallments);
    if (nextDueDate < new Date()) nextDueDate = new Date();
  }

  try {
    await db.installment.create({
      data: {
        userId: user.id, name, category,
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
  data: { name: string; monthlyAmount: number; paidInstallments: number; category?: string },
) {
  const user = await requireUser();
  const inst = await db.installment.findFirst({
    where: { id, userId: user.id },
    select: { totalInstallments: true, paidInstallments: true },
  });
  if (!inst) throw new Error("Cuota no encontrada");

  const paid = Math.max(0, data.paidInstallments);
  if (paid >= inst.totalInstallments) throw new Error("Las cuotas pagadas no pueden igualar o superar el total");
  if (data.monthlyAmount <= 0) throw new Error("El importe mensual debe ser mayor a cero");

  try {
    const ops: Promise<unknown>[] = [
      db.installment.update({
        where: { id },
        data: {
          name: data.name,
          monthlyAmount: data.monthlyAmount,
          paidInstallments: paid,
          ...(data.category !== undefined && { category: data.category }),
        },
      }),
    ];

    // When the paid count increases, sync the linked transaction name to reflect
    // the actual cuota number — avoids showing "1/12" when the user is at 7/12
    if (paid > inst.paidInstallments) {
      const linkedTx = await db.transaction.findFirst({
        where: { installmentId: id },
        orderBy: { date: "desc" },
      });
      if (linkedTx) {
        ops.push(
          db.transaction.update({
            where: { id: linkedTx.id },
            data: {
              name: `${data.name} · cuota ${paid}/${inst.totalInstallments}`,
              note: `Cuota ${paid} de ${inst.totalInstallments}`,
            },
          }),
        );
      }
    }

    await Promise.all(ops);
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
          installmentId: id,
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
