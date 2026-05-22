import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireMobileAuth } from '../_auth';
import { db } from '@/lib/db';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export async function GET(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(auth.userId);
  if (error || !user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    id:    user.id,
    email: user.email ?? '',
    name:  user.user_metadata?.name ?? null,
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json() as { monthlyBudget?: number };

  if (body.monthlyBudget !== undefined) {
    if (isNaN(body.monthlyBudget) || body.monthlyBudget < 0) {
      return NextResponse.json({ error: 'Invalid budget' }, { status: 400 });
    }
    await db.userSetting.upsert({
      where: { userId_key: { userId: auth.userId, key: 'monthlyBudget' } },
      update: { value: String(Math.round(body.monthlyBudget)) },
      create: { userId: auth.userId, key: 'monthlyBudget', value: String(Math.round(body.monthlyBudget)) },
    });
  }

  return NextResponse.json({ ok: true });
}
