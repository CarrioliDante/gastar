"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";

export async function createInstallment(formData: FormData) {
  const user = await requireUser();
  const name              = formData.get("name") as string;
  const totalAmount       = parseFloat(formData.get("totalAmount") as string);
  const monthlyAmount     = parseFloat(formData.get("monthlyAmount") as string);
  const totalInstallments = parseInt(formData.get("totalInstallments") as string);
  const paidInstallments  = Math.max(0, parseInt(formData.get("paidInstallments") as string) || 0);
  const nextDueDateStr    = formData.get("nextDueDate") as string;

  if (!name || isNaN(totalAmount) || isNaN(monthlyAmount) || isNaN(totalInstallments)) return;

  const nextDueDate = nextDueDateStr ? new Date(nextDueDateStr) : new Date();

  // Backdate startedAt by the number of already-paid installments
  const startedAt = new Date(nextDueDate);
  startedAt.setMonth(startedAt.getMonth() - paidInstallments);

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
}

export async function payInstallment(id: string) {
  const user = await requireUser();
  const inst = await db.installment.findFirst({ where: { id, userId: user.id } });
  if (!inst) return;

  const newPaid = inst.paidInstallments + 1;
  const completed = newPaid >= inst.totalInstallments;

  const next = new Date(inst.nextDueDate);
  next.setMonth(next.getMonth() + 1);

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
}

export async function deleteInstallment(id: string) {
  const user = await requireUser();
  await db.installment.deleteMany({ where: { id, userId: user.id } });
  revalidateTag(`user:${user.id}`, "default");
}
