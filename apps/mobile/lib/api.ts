import { supabase } from './supabase';
import { useAuthStore } from '../store/auth';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:3000';

function getToken(): string | null {
  // Read from the Zustand store — always reflects the latest session
  // (updated by onAuthStateChange in _layout.tsx on INITIAL_SESSION and TOKEN_REFRESHED)
  return useAuthStore.getState().session?.access_token ?? null;
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  let res: Response;
  try {
    res = await fetch(`${BASE}/api/mobile${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });
  } catch (err) {
    const e = new Error(`No se pudo conectar con el servidor (${BASE})`);
    (e as any).status = 0;
    throw e;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    const e = Object.assign(new Error(body.error ?? res.statusText), { status: res.status });
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
  todayStats: { spending: number; buckets: { label: string; amount: number }[] };
  weekStats: { spending: number; daily: { day: string; amount: number }[] };
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
  paid: boolean;
}

export interface UserProfile {
  id: string; email: string; name: string | null;
}

export interface Goal {
  id: string; name: string;
  target: number; current: number;
  deadline: string | null;
}

export interface CategoryItem {
  id: string;
  label: string;
  glyph: string;
  type: 'expense' | 'income';
}

export async function fetchCategories(): Promise<{ expenses: CategoryItem[]; incomes: CategoryItem[] }> {
  return apiFetch('/categories');
}

export async function saveCategories(categories: CategoryItem[]) {
  return apiFetch('/categories', { method: 'PUT', body: JSON.stringify({ categories }) });
}

// Health check — no auth required
export async function ping(): Promise<{ ok: boolean; time: string; error?: string }> {
  try {
    const res = await fetch(`${BASE}/api/mobile/ping`);
    if (!res.ok) return { ok: false, time: '', error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err) {
    return { ok: false, time: '', error: (err as Error).message };
  }
}
