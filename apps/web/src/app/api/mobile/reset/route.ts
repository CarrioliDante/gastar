import { NextRequest, NextResponse } from 'next/server';
import { requireMobileAuth } from '../_auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  await db.$transaction([
    // DollarOperation cascades from Transaction (onDelete: Cascade)
    db.transaction.deleteMany({ where: { userId: auth.userId } }),
    db.block.deleteMany({ where: { userId: auth.userId } }),
    db.installment.deleteMany({ where: { userId: auth.userId } }),
    db.savingsGoal.deleteMany({ where: { userId: auth.userId } }),
    db.recurringExpense.deleteMany({ where: { userId: auth.userId } }),
  ]);

  return NextResponse.json({ ok: true });
}
