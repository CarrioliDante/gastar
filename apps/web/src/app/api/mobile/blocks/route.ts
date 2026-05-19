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

export async function POST(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json() as {
    name: string; icon: string; budget: number; goal?: string;
  };

  if (!body.name || body.budget == null || isNaN(body.budget)) {
    return NextResponse.json({ error: 'Nombre y presupuesto son obligatorios' }, { status: 400 });
  }

  const block = await db.block.create({
    data: {
      userId: auth.userId,
      name: body.name,
      icon: body.icon || 'circle',
      budget: body.budget,
      goal: body.goal ?? null,
    },
  });

  return NextResponse.json({
    id: block.id,
    name: block.name,
    icon: block.icon,
    budget: Number(block.budget),
    spent: 0,
    txs: 0,
    goal: block.goal ?? '',
  }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json() as {
    id: string; name?: string; icon?: string; budget?: number; goal?: string;
  };

  if (!body.id) {
    return NextResponse.json({ error: 'id es obligatorio' }, { status: 400 });
  }

  const existing = await db.block.findFirst({
    where: { id: body.id, userId: auth.userId },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Bloque no encontrado' }, { status: 404 });
  }

  const updated = await db.block.update({
    where: { id: body.id },
    data: {
      ...(body.name != null ? { name: body.name } : {}),
      ...(body.icon != null ? { icon: body.icon } : {}),
      ...(body.budget != null ? { budget: body.budget } : {}),
      ...(body.goal !== undefined ? { goal: body.goal ?? null } : {}),
    },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    icon: updated.icon,
    budget: Number(updated.budget),
    goal: updated.goal ?? '',
  });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id es obligatorio' }, { status: 400 });
  }

  const existing = await db.block.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Bloque no encontrado' }, { status: 404 });
  }

  // Soft-delete via archivedAt to preserve transaction history
  await db.block.update({
    where: { id },
    data: { archivedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
