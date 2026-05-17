import { NextRequest, NextResponse } from 'next/server';
import { requireMobileAuth } from '../_auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const rows = await db.installment.findMany({
    where: { userId: auth.userId, completedAt: null },
    orderBy: { nextDueDate: 'asc' },
  });

  const installments = rows.map(inst => ({
    id:      inst.id,
    name:    inst.name,
    paid:    inst.paidInstallments,
    total:   inst.totalInstallments,
    monthly: Number(inst.monthlyAmount),
    nextDue: inst.nextDueDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
  }));

  return NextResponse.json(installments);
}
