import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireMobileAuth } from '../_auth';

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
