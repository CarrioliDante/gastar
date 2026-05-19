import { NextRequest, NextResponse } from "next/server";
import { requireMobileAuth } from "../_auth";
import { getCustomCategories, saveCustomCategories } from "@/lib/custom-categories";

export async function GET(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;
  const cats = await getCustomCategories(auth.userId);
  return NextResponse.json(cats);
}

export async function PUT(req: NextRequest) {
  const auth = await requireMobileAuth(req);
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  await saveCustomCategories(auth.userId, body.categories);
  return NextResponse.json({ ok: true });
}
