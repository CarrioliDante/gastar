"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/hooks/query-keys";
import {
  fetchDashboardStats,
  fetchRecentTransactions,
  fetchAllTransactions,
  fetchBlocks,
  fetchInstallments,
  fetchRecurring,
  fetchGoals,
  fetchBlockTransactions,
} from "@/app/actions/queries";

type DashboardStats = Awaited<ReturnType<typeof fetchDashboardStats>>;
type TransactionRow = Awaited<ReturnType<typeof fetchRecentTransactions>>[number];
type BlockRow = Awaited<ReturnType<typeof fetchBlocks>>[number];
type InstallmentRow = Awaited<ReturnType<typeof fetchInstallments>>[number];
type RecurringRow = Awaited<ReturnType<typeof fetchRecurring>>[number];
type GoalRow = Awaited<ReturnType<typeof fetchGoals>>[number];

export type { TransactionRow, BlockRow, InstallmentRow, RecurringRow, GoalRow };

export function useDashboardStats(initialData?: DashboardStats) {
  return useQuery({
    queryKey: qk.stats,
    queryFn: fetchDashboardStats,
    initialData,
    staleTime: 0,
  });
}

export function useRecentTransactions(initialData?: TransactionRow[]) {
  return useQuery({
    queryKey: qk.recentTx(8),
    queryFn: fetchRecentTransactions,
    initialData,
    staleTime: 0,
  });
}

export function useAllTransactions(initialData?: TransactionRow[]) {
  return useQuery({
    queryKey: qk.transactions,
    queryFn: fetchAllTransactions,
    initialData,
    staleTime: 0,
  });
}

export function useBlocks(initialData?: BlockRow[]) {
  return useQuery({
    queryKey: qk.blocks,
    queryFn: fetchBlocks,
    initialData,
    staleTime: 0,
  });
}

export function useInstallments(initialData?: InstallmentRow[]) {
  return useQuery({
    queryKey: qk.installments,
    queryFn: fetchInstallments,
    initialData,
    staleTime: 0,
  });
}

export function useRecurring(initialData?: RecurringRow[]) {
  return useQuery({
    queryKey: qk.recurring,
    queryFn: fetchRecurring,
    initialData,
    staleTime: 0,
  });
}

export function useGoals(initialData?: GoalRow[]) {
  return useQuery({
    queryKey: qk.goals,
    queryFn: fetchGoals,
    initialData,
    staleTime: 0,
  });
}

export type BlockTransactionRow = Awaited<ReturnType<typeof fetchBlockTransactions>>[number];

export function useBlockTransactions(blockId: string | null) {
  return useQuery({
    queryKey: ["block-transactions", blockId],
    queryFn: () => fetchBlockTransactions(blockId!),
    enabled: !!blockId,
    staleTime: 0,
  });
}
