import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  apiFetch,
  saveCategories,
  type StatsResponse,
  type TransactionsResponse,
  type Block,
  type Installment,
  type Recurring,
  type UserProfile,
  type Goal,
  type CategoryItem,
} from '../api';
import {
  adaptStats,
  adaptBlock,
  adaptInstallment,
  adaptRecurring,
  adaptTxGroup,
  adaptGoal,
  type StatsUI,
  type BlockUI,
  type InstallmentUI,
  type RecurringUI,
  type TxGroupUI,
  type TransactionUI,
  type GoalUI,
} from '../adapters';
import { useAuthStore } from '../../store/auth';

export function useStats() {
  const { isChecking } = useAuthStore();
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => apiFetch<StatsResponse>('/stats'),
    enabled: !isChecking,
    staleTime: 0,
  });
}

export function useTransactions(blockId?: string, month?: string) {
  const { isChecking } = useAuthStore();
  return useQuery({
    queryKey: ['transactions', blockId ?? 'all', month ?? 'current'],
    queryFn: () => {
      const params = new URLSearchParams();
      if (blockId) params.set('blockId', blockId);
      if (month) params.set('month', month);
      const qs = params.toString();
      return apiFetch<TransactionsResponse>(`/transactions${qs ? `?${qs}` : ''}`);
    },
    enabled: !isChecking,
    staleTime: 0,
  });
}

export function useGoals() {
  const { isChecking } = useAuthStore();
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => apiFetch<Goal[]>('/goals'),
    enabled: !isChecking,
    staleTime: 0,
  });
}

export function useBlocks() {
  const { isChecking } = useAuthStore();
  return useQuery({
    queryKey: ['blocks'],
    queryFn: () => apiFetch<Block[]>('/blocks'),
    enabled: !isChecking,
    staleTime: 0,
  });
}

export function useInstallments() {
  const { isChecking } = useAuthStore();
  return useQuery({
    queryKey: ['installments'],
    queryFn: () => apiFetch<Installment[]>('/installments'),
    enabled: !isChecking,
    staleTime: 0,
  });
}

export function useRecurring() {
  const { isChecking } = useAuthStore();
  return useQuery({
    queryKey: ['recurring'],
    queryFn: () => apiFetch<Recurring[]>('/recurring'),
    enabled: !isChecking,
    staleTime: 0,
  });
}

export function useUser() {
  const { isChecking } = useAuthStore();
  return useQuery({
    queryKey: ['user'],
    queryFn: () => apiFetch<UserProfile>('/user'),
    enabled: !isChecking,
    staleTime: 0,
  });
}

export function useCategories() {
  const { isChecking } = useAuthStore();
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<{ expenses: CategoryItem[]; incomes: CategoryItem[] }>('/categories'),
    enabled: !isChecking,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (list: CategoryItem[]) => saveCategories(list),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
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
      // Delay until after the sheet close animation completes (~1050ms total)
      // to avoid triggering concurrent refetches while the spring animation is running
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['stats'] });
        qc.invalidateQueries({ queryKey: ['transactions'] });
        qc.invalidateQueries({ queryKey: ['blocks'] });
      }, 1200);
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/transactions?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useCreateBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; icon: string; budget: number; goal?: string }) =>
      apiFetch('/blocks', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blocks'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { id: string; name?: string; icon?: string; budget?: number; goal?: string }) =>
      apiFetch('/blocks', { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blocks'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

// ── Savings goal mutations ─────────────────────────────────────────

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      targetAmount: number;
      currentAmount?: number;
      deadline?: string;
    }) => apiFetch('/goals', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useArchiveBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/blocks?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blocks'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

// ── Installment mutations ─────────────────────────────────────────

export function useCreateInstallment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      monthlyAmount: number;
      totalInstallments: number;
      paidInstallments?: number;
      nextDueDate?: string;
      startedAt?: string;
    }) => apiFetch('/installments', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['installments'] });
        qc.invalidateQueries({ queryKey: ['stats'] });
      }, 1200);
    },
  });
}

export function useUpdateInstallment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      id: string;
      name?: string;
      monthlyAmount?: number;
      paidInstallments?: number;
      nextDueDate?: string;
    }) => apiFetch('/installments', { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['installments'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function usePayInstallment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch('/installments/pay', { method: 'POST', body: JSON.stringify({ id }) }),
    onSuccess: () => {
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['installments'] });
        qc.invalidateQueries({ queryKey: ['stats'] });
        qc.invalidateQueries({ queryKey: ['transactions'] });
      }, 1200);
    },
  });
}

export function useDeleteInstallment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/installments?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['installments'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

// ── Recurring mutations ───────────────────────────────────────────

export function useCreateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      amount: number;
      category: string;
      frequency: string;
      dayOfMonth?: number;
      blockId?: string;
    }) => apiFetch('/recurring', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['recurring'] });
        qc.invalidateQueries({ queryKey: ['stats'] });
      }, 1200);
    },
  });
}

export function usePayRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch('/recurring/pay', { method: 'POST', body: JSON.stringify({ id }) }),
    onSuccess: () => {
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['recurring'] });
        qc.invalidateQueries({ queryKey: ['stats'] });
        qc.invalidateQueries({ queryKey: ['transactions'] });
      }, 1200);
    },
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/recurring?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useToggleRecurringPause() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch('/recurring/pause', { method: 'POST', body: JSON.stringify({ id }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring'] });
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
              id:          t.id,
              label:       t.name,
              meta:        `${t.category} · ${t.time}`,
              amount:      t.amount,
              glyph:       'Home' as const,
              installment: undefined,
              blockId:     t.blockId,
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
  patterns: { value: string; label: string }[];
}

export function useInsights() {
  const stats = useStats();
  const installments = useInstallments();
  const recurring = useRecurring();
  const transactions = useTransactions();

  const isLoading = stats.isLoading || installments.isLoading || recurring.isLoading || transactions.isLoading;
  const isError = stats.isError || installments.isError || recurring.isError || transactions.isError;

  const data: InsightsData | null =
    stats.data
      ? (() => {
          const s = adaptStats(stats.data);
          const rawTxs = (transactions.data?.groups ?? []).flatMap(g => g.txs);
          const monthTxs = rawTxs.filter(t => t.amount < 0);

          // Peak day of spending
          const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
          let peakDay = '—';
          if (s.monthSeries.length > 0) {
            const maxIdx = s.monthSeries.indexOf(Math.max(...s.monthSeries));
            const now = new Date();
            const peakDate = new Date(now.getFullYear(), now.getMonth(), maxIdx + 1);
            peakDay = dayNames[peakDate.getDay()];
          }

          // Peak hour from raw tx times (time is "HH:MM" string from API)
          let peakHour = '—';
          if (monthTxs.length > 0) {
            const hourCounts = new Map<number, number>();
            for (const t of monthTxs) {
              const timeStr = (t as { time?: string }).time;
              if (timeStr) {
                const h = parseInt(timeStr.split(':')[0], 10);
                if (!isNaN(h)) hourCounts.set(h, (hourCounts.get(h) ?? 0) + 1);
              }
            }
            if (hourCounts.size > 0) {
              const best = [...hourCounts.entries()].sort((a, b) => b[1] - a[1])[0];
              peakHour = `${String(best[0]).padStart(2, '0')}:00`;
            }
          }

          // Active days with transactions
          const activeDays = s.monthSeries.filter(v => v > 0).length;

          // Top category
          const topCat = s.categories[0]?.label ?? '—';

          const patterns = [
            { value: peakDay,            label: 'día de más gasto' },
            { value: peakHour,           label: 'hora pico' },
            { value: String(activeDays), label: 'días con movimientos' },
            { value: topCat,             label: 'categoría principal' },
          ];

          return {
            stats: s,
            installments: (installments.data ?? []).map(adaptInstallment),
            recurring: (recurring.data ?? []).map(adaptRecurring),
            recurringMonthly: (recurring.data ?? []).reduce(
              (acc, r) => acc + (r.freq === 'bimestral' ? r.amount / 2 : r.amount),
              0,
            ),
            patterns,
          };
        })()
      : null;

  return { data, isLoading, isError };
}
