import { NextRequest, NextResponse } from 'next/server';
import { requireMobileAuth } from '../_auth';
import { db } from '@/lib/db';

function relativeDate(date: Date): string {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yest  = new Date(today); yest.setDate(yest.getDate() - 1);
  const d     = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (d.getTime() === today.getTime()) return 'Hoy';
  if (d.getTime() === yest.getTime())  return 'Ayer';
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

export async function GET(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const blockId = searchParams.get('blockId');

  const rows = await db.transaction.findMany({
    where: { userId: auth.userId, ...(blockId ? { blockId } : {}) },
    orderBy: { date: 'desc' },
  });

  // Group by ISO date
  const groups: {
    date: string; isoDate: string; total: number;
    txs: { id: string; name: string; category: string; amount: number; time: string; note?: string; blockId?: string }[];
  }[] = [];
  const seen = new Map<string, (typeof groups)[0]>();

  for (const row of rows) {
    const iso = row.date.toISOString().slice(0, 10);
    if (!seen.has(iso)) {
      const g = { date: relativeDate(row.date), isoDate: iso, total: 0, txs: [] };
      seen.set(iso, g);
      groups.push(g);
    }
    const g = seen.get(iso)!;
    const amount = Number(row.amount);
    g.txs.push({
      id:       row.id,
      name:     row.name,
      category: row.category,
      amount,
      time:     row.date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }),
      note:     row.note ?? undefined,
      blockId:  row.blockId ?? undefined,
    });
    g.total += amount;
  }

  return NextResponse.json({ groups, total: rows.length });
}

export async function POST(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json() as {
    name: string; amount: number; category: string;
    blockId?: string; note?: string; date?: string;
  };

  // Validate blockId belongs to user — silent fallback if not
  let blockId = body.blockId && body.blockId.trim() ? body.blockId.trim() : null;
  if (blockId) {
    const block = await db.block.findFirst({ where: { id: blockId, userId: auth.userId } });
    if (!block) blockId = null;
  }

  const tx = await db.transaction.create({
    data: {
      userId:   auth.userId,
      name:     body.name,
      amount:   body.amount,
      category: body.category,
      blockId,
      note:     body.note ?? null,
      date:     body.date ? new Date(body.date) : new Date(),
    },
  });

  return NextResponse.json({ id: tx.id }, { status: 201 });
}
