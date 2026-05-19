import { NextRequest, NextResponse } from 'next/server';
import { requireMobileAuth } from '../../_auth';
import { db } from '@/lib/db';

const FREQ_DAYS: Record<string, number> = {
  weekly: 7, monthly: 30, bimonthly: 60, yearly: 365,
};

function advanceByMonth(from: Date, dayOfMonth: number): Date {
  return new Date(from.getFullYear(), from.getMonth() + 1, dayOfMonth);
}

export async function POST(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json() as { id: string };
  if (!body.id) {
    return NextResponse.json({ error: 'ID es obligatorio' }, { status: 400 });
  }

  const rec = await db.recurringExpense.findFirst({
    where: { id: body.id, userId: auth.userId },
  });
  if (!rec) {
    return NextResponse.json({ error: 'Gasto recurrente no encontrado' }, { status: 404 });
  }

  let next: Date;
  if (rec.dayOfMonth && rec.frequency === 'monthly') {
    next = advanceByMonth(rec.nextDueDate, rec.dayOfMonth);
  } else {
    const days = FREQ_DAYS[rec.frequency] ?? 30;
    next = new Date(rec.nextDueDate);
    next.setDate(next.getDate() + days);
  }

  await Promise.all([
    db.transaction.create({
      data: {
        userId: auth.userId,
        name: rec.name,
        amount: -Math.abs(Number(rec.amount)),
        category: rec.category,
        note: `Recurrente · ${rec.frequency}`,
        blockId: rec.blockId,
      },
    }),
    db.recurringExpense.update({
      where: { id: body.id },
      data: { nextDueDate: next, lastPaidAt: new Date() },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    nextDueDate: next.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
  });
}
