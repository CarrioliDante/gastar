import { NextRequest, NextResponse } from 'next/server';
import { requireMobileAuth } from '../_auth';
import { db } from '@/lib/db';
import { getDollarData, getDollarBalance } from '@/lib/queries/dolar';
import { fetchDolarRates } from '@/lib/dolar';

export async function GET(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const balanceOnly = url.searchParams.get('balance') === '1';

  if (balanceOnly) {
    const totalUsd = await getDollarBalance(auth.userId);
    return NextResponse.json({ totalUsd });
  }

  const [dollarData, dolarRates] = await Promise.all([
    getDollarData(auth.userId),
    fetchDolarRates().catch(() => null),
  ]);

  return NextResponse.json({
    totalUsd: dollarData.totalUsd,
    avgCost: dollarData.avgCost,
    operations: dollarData.operations,
    rates: dolarRates
      ? { blue: dolarRates.blue, oficial: dolarRates.oficial }
      : null,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json() as {
    type: 'BUY' | 'SELL';
    usdAmount: number;
    rate: number;
    note?: string;
  };

  if (!body.type || body.type !== 'BUY' && body.type !== 'SELL') {
    return NextResponse.json({ error: 'Tipo inválido (BUY o SELL)' }, { status: 400 });
  }
  if (!body.usdAmount || body.usdAmount <= 0) {
    return NextResponse.json({ error: 'El monto en USD debe ser mayor a cero' }, { status: 400 });
  }
  if (!body.rate || body.rate <= 0) {
    return NextResponse.json({ error: 'La cotización debe ser mayor a cero' }, { status: 400 });
  }

  const usdAmount = body.usdAmount;
  const rate = body.rate;

  if (body.type === 'SELL') {
    const buysAgg = await db.dollarOperation.aggregate({
      where: { userId: auth.userId, type: 'BUY' },
      _sum: { usdAmount: true },
    });
    const sellsAgg = await db.dollarOperation.aggregate({
      where: { userId: auth.userId, type: 'SELL' },
      _sum: { usdAmount: true },
    });
    const currentUsd = Number(buysAgg._sum.usdAmount ?? 0) - Number(sellsAgg._sum.usdAmount ?? 0);
    if (usdAmount > currentUsd) {
      return NextResponse.json({ error: `No tenés suficientes USD. Disponible: USD ${currentUsd.toFixed(2)}` }, { status: 400 });
    }
  }

  const arsAmount = Math.round(usdAmount * rate * 100) / 100;

  try {
    await db.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId: auth.userId,
          name: body.type === 'BUY' ? 'Compra USD' : 'Venta USD',
          amount: body.type === 'BUY' ? -arsAmount : arsAmount,
          category: 'dolar',
          note: body.note ?? `${body.type === 'BUY' ? 'Compra' : 'Venta'} de USD ${usdAmount} a $${rate}`,
        },
      });

      await tx.dollarOperation.create({
        data: {
          userId: auth.userId,
          type: body.type,
          usdAmount,
          arsAmount,
          rate,
          transactionId: transaction.id,
          note: body.note ?? null,
        },
      });
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('dolar POST failed:', err);
    return NextResponse.json({ error: 'Error al guardar la operación' }, { status: 500 });
  }
}
