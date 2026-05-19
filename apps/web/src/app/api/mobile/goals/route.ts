import { NextRequest, NextResponse } from 'next/server';
import { requireMobileAuth } from '../_auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const rows = await db.savingsGoal.findMany({
    where: { userId: auth.userId, completedAt: null },
    orderBy: { createdAt: 'asc' },
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
