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
      deadline:      body.deadline ? new Date(body.deadline) : null,
    },
  });

  return NextResponse.json({ id: goal.id }, { status: 201 });
}
