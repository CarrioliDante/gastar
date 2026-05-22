import { NextRequest, NextResponse } from 'next/server';
import { requireMobileAuth } from '../_auth';
import { db } from '@/lib/db';

const FREQ_ES: Record<string, string> = {
  monthly:   'mensual',
  weekly:    'semanal',
  bimonthly: 'bimestral',
  yearly:    'anual',
};

const FREQ_DAYS: Record<string, number> = {
  weekly: 7, monthly: 30, bimonthly: 60, yearly: 365,
};

export async function GET(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const rows = await db.recurringExpense.findMany({
    where: { userId: auth.userId, pausedAt: null },
    orderBy: { nextDueDate: 'asc' },
  });

  const recurring = rows.map(r => {
    const paid =
      r.lastPaidAt !== null &&
      r.lastPaidAt.getMonth() === new Date().getMonth() &&
      r.lastPaidAt.getFullYear() === new Date().getFullYear();

    return {
      id:       r.id,
      name:     r.name,
      amount:   Number(r.amount),
      category: r.category,
      freq:     FREQ_ES[r.frequency] ?? r.frequency,
      nextDue:     r.nextDueDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
      nextDueIso:  r.nextDueDate.toISOString().slice(0, 10),
      blockId:  r.blockId ?? undefined,
      paid,
    };
  });

  return NextResponse.json(recurring);
}

export async function POST(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json() as {
    name: string;
    amount: number;
    category: string;
    frequency: string;
    dayOfMonth?: number;
    blockId?: string;
    note?: string;
  };

  if (!body.name || body.amount == null || isNaN(body.amount)) {
    return NextResponse.json({ error: 'Nombre e importe son obligatorios' }, { status: 400 });
  }

  let nextDueDate: Date;
  if (body.dayOfMonth && body.frequency === 'monthly') {
    const now = new Date();
    let d = new Date(now.getFullYear(), now.getMonth(), body.dayOfMonth);
    if (d <= now) d = new Date(now.getFullYear(), now.getMonth() + 1, body.dayOfMonth);
    nextDueDate = d;
  } else {
    nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + (FREQ_DAYS[body.frequency] ?? 30));
  }

  const rec = await db.recurringExpense.create({
    data: {
      userId: auth.userId,
      name: body.name,
      amount: body.amount,
      category: body.category,
      frequency: body.frequency,
      dayOfMonth: body.dayOfMonth ?? null,
      blockId: body.blockId ?? null,
      note: body.note ?? null,
      nextDueDate,
    },
  });

  return NextResponse.json({ id: rec.id }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json() as {
    id: string;
    name?: string;
    amount?: number;
    category?: string;
    frequency?: string;
    dayOfMonth?: number;
  };

  if (!body.id) {
    return NextResponse.json({ error: 'ID es obligatorio' }, { status: 400 });
  }

  const existing = await db.recurringExpense.findFirst({
    where: { id: body.id, userId: auth.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Gasto recurrente no encontrado' }, { status: 404 });
  }

  await db.recurringExpense.update({
    where: { id: body.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.amount !== undefined && { amount: body.amount }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.frequency !== undefined && { frequency: body.frequency }),
      ...(body.dayOfMonth !== undefined && { dayOfMonth: body.dayOfMonth }),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const id = new URL(req.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID es obligatorio' }, { status: 400 });
  }

  const existing = await db.recurringExpense.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Gasto recurrente no encontrado' }, { status: 404 });
  }

  await db.recurringExpense.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
