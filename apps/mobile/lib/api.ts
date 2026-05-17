import { supabase } from './supabase';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${BASE}/api/mobile${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    const e = Object.assign(new Error(err.error ?? res.statusText), { status: res.status });
    throw e;
  }

  return res.json() as Promise<T>;
}

// ── Typed response shapes ───────────────────────────────────────────────────

export interface StatsResponse {
  balance: number;
  monthly: { income: number; spending: number; budget: number; available: number };
  dailySeries: number[];
  netWorth24mo: number[];
  categories: { name: string; amount: number; share: number }[];
  pulso: number;
}

export interface TxGroup {
  date: string;
  isoDate: string;
  total: number;
  txs: {
    id: string; name: string; category: string;
    amount: number; time: string; note?: string; blockId?: string;
  }[];
}

export interface TransactionsResponse {
  groups: TxGroup[];
  total: number;
}

export interface Block {
  id: string; name: string; icon: string;
  budget: number; spent: number; txs: number; goal: string;
}

export interface Installment {
  id: string; name: string;
  paid: number; total: number; monthly: number; nextDue: string;
}

export interface Recurring {
  id: string; name: string; amount: number;
  category: string; freq: string; nextDue: string; blockId?: string;
}

export interface UserProfile {
  id: string; email: string; name: string | null;
}
