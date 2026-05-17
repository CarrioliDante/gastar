import { NextRequest, NextResponse } from 'next/server';
import { requireMobileAuth } from '../_auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const rows = await db.block.findMany({
    where: { userId: auth.userId, archivedAt: null },
    include: {
      transactions: {
        where: { date: { gte: startOfMonth } },
        select: { amount: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const blocks = rows.map(b => ({
    id:     b.id,
    name:   b.name,
    icon:   b.icon,
    budget: Number(b.budget),
    spent:  b.transactions.reduce((s, t) => s + Math.abs(Number(t.amount)), 0),
    txs:    b.transactions.length,
    goal:   b.goal ?? '',
  }));

  return NextResponse.json(blocks);
}
