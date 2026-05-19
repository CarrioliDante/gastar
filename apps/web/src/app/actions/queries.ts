"use server";

import { requireUser } from "@/lib/dal";
import { getDashboardStats } from "@/lib/queries/stats";
import { getRecentTransactions, getAllTransactions } from "@/lib/queries/transactions";
import { getBlocks, getTransactionsByBlock } from "@/lib/queries/blocks";
import { getActiveInstallments } from "@/lib/queries/installments";
import { getRecurringExpenses } from "@/lib/queries/recurring";
import { getSavingsGoals } from "@/lib/queries/goals";

export async function fetchDashboardStats() {
  const user = await requireUser();
  return getDashboardStats(user.id);
}

export async function fetchRecentTransactions() {
  const user = await requireUser();
  return getRecentTransactions(user.id);
}

export async function fetchAllTransactions() {
  const user = await requireUser();
  return getAllTransactions(user.id);
}

export async function fetchBlocks() {
  const user = await requireUser();
  return getBlocks(user.id);
}

export async function fetchInstallments() {
  const user = await requireUser();
  return getActiveInstallments(user.id);
}

export async function fetchRecurring() {
  const user = await requireUser();
  return getRecurringExpenses(user.id);
}

export async function fetchGoals() {
  const user = await requireUser();
  return getSavingsGoals(user.id);
}

export async function fetchBlockTransactions(blockId: string) {
  const user = await requireUser();
  return getTransactionsByBlock(blockId, user.id);
}
