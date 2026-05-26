import { NextRequest, NextResponse } from 'next/server';
import { requireMobileAuth } from '../_auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const rows = await db.installment.findMany({
    where: { userId: auth.userId },
    orderBy: [{ completedAt: 'asc' }, { nextDueDate: 'asc' }],
  });

  const installments = rows.map(inst => ({
    id:          inst.id,
    name:        inst.name,
    category:    inst.category,
    paid:        inst.paidInstallments,
    total:       inst.totalInstallments,
    monthly:     Number(inst.monthlyAmount),
    nextDue:     inst.nextDueDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
    nextDueIso:  inst.nextDueDate.toISOString().slice(0, 10),
    completedAt: inst.completedAt ? inst.completedAt.toISOString() : null,
  }));

  return NextResponse.json(installments);
}

export async function POST(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json() as {
    name: string;
    category?: string;
    monthlyAmount: number;
    totalInstallments: number;
    paidInstallments?: number;
    nextDueDate?: string;
    startedAt?: string;
  };

  if (!body.name || !body.monthlyAmount || !body.totalInstallments) {
    return NextResponse.json({ error: 'Nombre, importe mensual y cantidad de cuotas son obligatorios' }, { status: 400 });
  }

  const installment = await db.installment.create({
    data: {
      userId: auth.userId,
      name: body.name,
      category: body.category ?? 'Cuotas',
      totalAmount: body.monthlyAmount * body.totalInstallments,
      monthlyAmount: body.monthlyAmount,
      totalInstallments: body.totalInstallments,
      paidInstallments: body.paidInstallments ?? 0,
      nextDueDate: body.nextDueDate ? new Date(body.nextDueDate) : new Date(),
      startedAt: body.startedAt ? new Date(body.startedAt) : new Date(),
    },
  });

  return NextResponse.json({ id: installment.id }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json() as {
    id: string;
    name?: string;
    category?: string;
    monthlyAmount?: number;
    paidInstallments?: number;
    nextDueDate?: string;
  };

  if (!body.id) {
    return NextResponse.json({ error: 'ID es obligatorio' }, { status: 400 });
  }

  const existing = await db.installment.findFirst({
    where: { id: body.id, userId: auth.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Cuota no encontrada' }, { status: 404 });
  }

  const ops: Promise<unknown>[] = [
    db.installment.update({
      where: { id: body.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.monthlyAmount !== undefined && { monthlyAmount: body.monthlyAmount }),
        ...(body.paidInstallments !== undefined && { paidInstallments: body.paidInstallments }),
        ...(body.nextDueDate !== undefined && { nextDueDate: new Date(body.nextDueDate) }),
      },
    }),
  ];

  if (body.paidInstallments !== undefined && body.paidInstallments > existing.paidInstallments) {
    const linkedTx = await db.transaction.findFirst({
      where: { installmentId: body.id },
      orderBy: { date: 'desc' },
    });
    if (linkedTx) {
      const instName = body.name ?? existing.name;
      const total = existing.totalInstallments;
      ops.push(
        db.transaction.update({
          where: { id: linkedTx.id },
          data: {
            name: `${instName} · cuota ${body.paidInstallments}/${total}`,
            note: `Cuota ${body.paidInstallments} de ${total}`,
          },
        }),
      );
    }
  }

  await Promise.all(ops);

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const id = new URL(req.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID es obligatorio' }, { status: 400 });
  }

  const existing = await db.installment.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Cuota no encontrada' }, { status: 404 });
  }

  await db.installment.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
