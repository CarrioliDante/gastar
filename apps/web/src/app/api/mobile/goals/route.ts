import { NextRequest, NextResponse } from 'next/server';
import { requireMobileAuth } from '../_auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const showCompleted = url.searchParams.get('completed') === '1';

  const rows = await db.savingsGoal.findMany({
    where: { userId: auth.userId, completedAt: showCompleted ? { not: null } : null },
    orderBy: showCompleted ? { completedAt: 'desc' } : { createdAt: 'asc' },
  });

  const goals = rows.map(g => ({
    id:        g.id,
    name:      g.name,
    target:    Number(g.targetAmount),
    current:   Number(g.currentAmount),
    currency:  g.currency,
    deadline:  g.deadline
      ? g.deadline.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
      : null,
  }));

  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json() as {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    currency?: string;
    deadline?: string;
  };

  if (!body.name || !body.targetAmount) {
    return NextResponse.json({ error: 'Nombre y monto objetivo son obligatorios' }, { status: 400 });
  }

  const goal = await db.savingsGoal.create({
    data: {
      userId:        auth.userId,
      name:          body.name,
      targetAmount:  body.targetAmount,
      currentAmount: body.currentAmount ?? 0,
      currency:      body.currency === "USD" ? "USD" : "ARS",
      deadline:      body.deadline ? new Date(body.deadline) : null,
    },
  });

  return NextResponse.json({ id: goal.id }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json() as {
    id: string;
    name?: string;
    targetAmount?: number;
    currentAmount?: number;
    currency?: string;
    deadline?: string | null;
  };

  if (!body.id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  const existing = await db.savingsGoal.findFirst({
    where: { id: body.id, userId: auth.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Meta no encontrada' }, { status: 404 });
  }

  const updated = await db.savingsGoal.update({
    where: { id: body.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.targetAmount !== undefined && { targetAmount: body.targetAmount }),
      ...(body.currentAmount !== undefined && { currentAmount: body.currentAmount }),
      ...(body.currency !== undefined && { currency: body.currency === "USD" ? "USD" : "ARS" }),
      ...(body.deadline !== undefined && { deadline: body.deadline ? new Date(body.deadline) : null }),
    },
  });

  return NextResponse.json({
    id:        updated.id,
    name:      updated.name,
    target:    Number(updated.targetAmount),
    current:   Number(updated.currentAmount),
    currency:  updated.currency,
    deadline:  updated.deadline
      ? updated.deadline.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
      : null,
  });
}
