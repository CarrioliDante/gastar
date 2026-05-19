import { NextRequest, NextResponse } from 'next/server';
import { requireMobileAuth } from '../../_auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json() as { id: string };
  if (!body.id) {
    return NextResponse.json({ error: 'ID es obligatorio' }, { status: 400 });
  }

  const inst = await db.installment.findFirst({
    where: { id: body.id, userId: auth.userId },
  });
  if (!inst) {
    return NextResponse.json({ error: 'Cuota no encontrada' }, { status: 404 });
  }

  const newPaid = inst.paidInstallments + 1;
  const completed = newPaid >= inst.totalInstallments;

  const next = new Date(inst.nextDueDate);
  next.setMonth(next.getMonth() + 1);

  await Promise.all([
    db.installment.update({
      where: { id: body.id },
      data: {
        paidInstallments: newPaid,
        nextDueDate: next,
        completedAt: completed ? new Date() : null,
      },
    }),
    db.transaction.create({
      data: {
        userId: auth.userId,
        name: `${inst.name} · cuota ${newPaid}/${inst.totalInstallments}`,
        amount: -Number(inst.monthlyAmount),
        category: 'Cuotas',
        note: `Cuota ${newPaid} de ${inst.totalInstallments}`,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    nextDueDate: next.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
    paidInstallments: newPaid,
  });
}
