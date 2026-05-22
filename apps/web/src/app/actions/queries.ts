"use server";

import { requireUser } from "@/lib/dal";
import { getDashboardStats } from "@/lib/queries/stats";
import { getRecentTransactions, getAllTransactions } from "@/lib/queries/transactions";
import { getBlocks, getTransactionsByBlock, getArchivedBlocks } from "@/lib/queries/blocks";
import { getActiveInstallments } from "@/lib/queries/installments";
import { getRecurringExpenses } from "@/lib/queries/recurring";
import { getSavingsGoals, getCompletedGoals } from "@/lib/queries/goals";
import { getCustomCategories } from "@/lib/custom-categories";
import { getDollarData, getDollarBalance } from "@/lib/queries/dolar";

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

export async function fetchCompletedGoals() {
  const user = await requireUser();
  return getCompletedGoals(user.id);
}

export async function fetchArchivedBlocks() {
  const user = await requireUser();
  return getArchivedBlocks(user.id);
}

export async function fetchBlockTransactions(blockId: string) {
  const user = await requireUser();
  return getTransactionsByBlock(blockId, user.id);
}

export async function fetchCustomCategories() {
  const user = await requireUser();
  return getCustomCategories(user.id);
}

export async function fetchDollarData() {
  const user = await requireUser();
  return getDollarData(user.id);
}

export async function fetchDollarBalance() {
  const user = await requireUser();
  return getDollarBalance(user.id);
}
