import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  apiFetch,
  type StatsResponse,
  type TransactionsResponse,
  type Block,
  type Installment,
  type Recurring,
  type UserProfile,
} from '../api';
import {
  adaptStats,
  adaptBlock,
  adaptInstallment,
  adaptRecurring,
  adaptTxGroup,
  type StatsUI,
  type BlockUI,
  type InstallmentUI,
  type RecurringUI,
  type TxGroupUI,
  type TransactionUI,
} from '../adapters';

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => apiFetch<StatsResponse>('/stats'),
  });
}

export function useTransactions(blockId?: string) {
  return useQuery({
    queryKey: ['transactions', blockId ?? 'all'],
    queryFn: () => apiFetch<TransactionsResponse>(`/transactions${blockId ? `?blockId=${blockId}` : ''}`),
  });
}

export function useBlocks() {
  return useQuery({
    queryKey: ['blocks'],
    queryFn: () => apiFetch<Block[]>('/blocks'),
  });
}

export function useInstallments() {
  return useQuery({
    queryKey: ['installments'],
    queryFn: () => apiFetch<Installment[]>('/installments'),
  });
}

export function useRecurring() {
  return useQuery({
    queryKey: ['recurring'],
    queryFn: () => apiFetch<Recurring[]>('/recurring'),
  });
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => apiFetch<UserProfile>('/user'),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string; amount: number; category: string;
      blockId?: string; note?: string; date?: string;
    }) => apiFetch('/transactions', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['blocks'] });
    },
  });
}

// ── Composite hooks ──────────────────────────────────────────────

interface DashboardData {
  stats: StatsUI;
  blocks: BlockUI[];
  installments: InstallmentUI[];
  recurring: RecurringUI[];
  recent: TransactionUI[];
  groups: TxGroupUI[];
}

export function useDashboard() {
  const stats = useStats();
  const blocks = useBlocks();
  const installments = useInstallments();
  const recurring = useRecurring();
  const transactions = useTransactions();

  const isLoading =
    stats.isLoading ||
    blocks.isLoading ||
    installments.isLoading ||
    recurring.isLoading ||
    transactions.isLoading;

  const isError =
    stats.isError ||
    blocks.isError ||
    installments.isError ||
    recurring.isError ||
    transactions.isError;

  const data: DashboardData | null =
    stats.data
      ? {
          stats:        adaptStats(stats.data),
          blocks:       (blocks.data ?? []).map(adaptBlock),
          installments: (installments.data ?? []).map(adaptInstallment),
          recurring:    (recurring.data ?? []).map(adaptRecurring),
          recent:       transactions.data?.groups
            .flatMap(g => g.txs)
            .slice(0, 8)
            .map(t => ({
              label:       t.name,
              meta:        `${t.category} · ${t.time}`,
              amount:      t.amount,
              glyph:       'dot' as const,
              installment: undefined,
            })) ?? [],
          groups:       (transactions.data?.groups ?? []).map(adaptTxGroup),
        }
      : null;

  return { data, isLoading, isError };
}

interface InsightsData {
  stats: StatsUI;
  installments: InstallmentUI[];
  recurring: RecurringUI[];
  recurringMonthly: number;
}

export function useInsights() {
  const stats = useStats();
  const installments = useInstallments();
  const recurring = useRecurring();

  const isLoading = stats.isLoading || installments.isLoading || recurring.isLoading;
  const isError = stats.isError || installments.isError || recurring.isError;

  const data: InsightsData | null =
    stats.data
      ? {
          stats:            adaptStats(stats.data),
          installments:     (installments.data ?? []).map(adaptInstallment),
          recurring:        (recurring.data ?? []).map(adaptRecurring),
          recurringMonthly: (recurring.data ?? []).reduce(
            (s, r) => s + (r.freq === 'bimestral' ? r.amount / 2 : r.amount),
            0,
          ),
        }
      : null;

  return { data, isLoading, isError };
}
