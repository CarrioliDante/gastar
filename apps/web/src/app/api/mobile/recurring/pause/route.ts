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

  const rec = await db.recurringExpense.findFirst({
    where: { id: body.id, userId: auth.userId },
    select: { pausedAt: true },
  });
  if (!rec) {
    return NextResponse.json({ error: 'Gasto recurrente no encontrado' }, { status: 404 });
  }

  await db.recurringExpense.update({
    where: { id: body.id },
    data: { pausedAt: rec.pausedAt ? null : new Date() },
  });

  return NextResponse.json({ ok: true, paused: !rec.pausedAt });
}
