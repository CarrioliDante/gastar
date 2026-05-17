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
