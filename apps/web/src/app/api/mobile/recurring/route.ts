import { NextRequest, NextResponse } from 'next/server';
import { requireMobileAuth } from '../_auth';
import { db } from '@/lib/db';

const FREQ_ES: Record<string, string> = {
  monthly:   'mensual',
  weekly:    'semanal',
  bimonthly: 'bimestral',
  yearly:    'anual',
};

export async function GET(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const rows = await db.recurringExpense.findMany({
    where: { userId: auth.userId, pausedAt: null },
    orderBy: { nextDueDate: 'asc' },
  });

  const recurring = rows.map(r => ({
    id:       r.id,
    name:     r.name,
    amount:   Number(r.amount),
    category: r.category,
    freq:     FREQ_ES[r.frequency] ?? r.frequency,
    nextDue:  r.nextDueDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
    blockId:  r.blockId ?? undefined,
  }));

  return NextResponse.json(recurring);
}
