"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/hooks/query-keys";
import type { TransactionRow, InstallmentRow, RecurringRow, GoalRow, BlockRow } from "@/hooks/queries";

import { createTransaction, deleteTransaction } from "@/app/actions/transactions";
import { createInstallment, payInstallment, deleteInstallment, updateInstallment } from "@/app/actions/installments";
import { createRecurring, markRecurringPaid, deleteRecurring, toggleRecurringPause, updateRecurring } from "@/app/actions/recurring";
import { createBlock, archiveBlock, unarchiveBlock, updateBlock } from "@/app/actions/blocks";
import { createGoal, contributeToGoal, deleteGoal, updateSavingsGoal } from "@/app/actions/goals";
import { buyDollars, sellDollars } from "@/app/actions/dolar";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function snapshot<T>(qc: ReturnType<typeof useQueryClient>, key: readonly unknown[]) {
  return qc.getQueryData<T>(key as never);
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) => createTransaction(fd),
    onMutate: async (fd) => {
      await qc.cancelQueries({ queryKey: ["transactions"] });
      await qc.cancelQueries({ queryKey: ["stats"] });

      const prevAll = snapshot<TransactionRow[]>(qc, qk.transactions);
      const prevRecent = snapshot<TransactionRow[]>(qc, qk.recentTx(8));

      const amount = parseFloat(fd.get("amount") as string);
      const category = fd.get("category") as string;
      const name = (fd.get("name") as string) || category;
      const blockId = (fd.get("blockId") as string) || undefined;
      const now = new Date();
      const opt: TransactionRow = {
        id: `opt-${Date.now()}`,
        name, category, amount,
        date: "Hoy",
        time: now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }),
        isoDate: now.toISOString().slice(0, 10),
        note: (fd.get("note") as string) || undefined,
        blockId: (fd.get("blockId") as string) || undefined,
      };

      qc.setQueryData<TransactionRow[]>(qk.transactions, (old) => old ? [opt, ...old] : [opt]);
      qc.setQueryData<TransactionRow[]>(qk.recentTx(8), (old) => old ? [opt, ...old].slice(0, 8) : [opt]);

      let prevBlockTxs: TransactionRow[] | undefined;
      if (blockId) {
        prevBlockTxs = snapshot<TransactionRow[]>(qc, ["block-transactions", blockId]);
        qc.setQueryData<TransactionRow[]>(["block-transactions", blockId], (old) =>
          old ? [opt, ...old] : [opt]
        );
      }

      return { prevAll, prevRecent, prevBlockTxs, blockId };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevAll !== undefined) qc.setQueryData(qk.transactions, ctx.prevAll);
      if (ctx?.prevRecent !== undefined) qc.setQueryData(qk.recentTx(8), ctx.prevRecent);
      if (ctx?.blockId && ctx?.prevBlockTxs !== undefined) {
        qc.setQueryData(["block-transactions", ctx.blockId], ctx.prevBlockTxs);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["blocks"] });
      qc.invalidateQueries({ queryKey: ["block-transactions"] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["transactions"] });
      const prevAll = snapshot<TransactionRow[]>(qc, qk.transactions);
      const prevRecent = snapshot<TransactionRow[]>(qc, qk.recentTx(8));

      qc.setQueryData<TransactionRow[]>(qk.transactions, (old) => old?.filter(t => t.id !== id));
      qc.setQueryData<TransactionRow[]>(qk.recentTx(8), (old) => old?.filter(t => t.id !== id));

      return { prevAll, prevRecent };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevAll !== undefined) qc.setQueryData(qk.transactions, ctx.prevAll);
      if (ctx?.prevRecent !== undefined) qc.setQueryData(qk.recentTx(8), ctx.prevRecent);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["blocks"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Installments
// ---------------------------------------------------------------------------

export function useCreateInstallment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) => createInstallment(fd),
    onMutate: async (fd) => {
      await qc.cancelQueries({ queryKey: ["installments"] });
      const prev = snapshot<InstallmentRow[]>(qc, qk.installments);

      const totalInstallments = parseInt(fd.get("totalInstallments") as string) || 1;
      const paidInstallments = Math.max(0, parseInt(fd.get("paidInstallments") as string) || 0);
      const totalAmount = parseFloat(fd.get("totalAmount") as string) || 0;
      const monthlyAmount = totalAmount / totalInstallments;
      const nextDueDateStr = fd.get("nextDueDate") as string;
      const nextDue = nextDueDateStr
        ? new Date(nextDueDateStr).toLocaleDateString("es-AR", { month: "short", day: "numeric" })
        : new Date().toLocaleDateString("es-AR", { month: "short", day: "numeric" });

      const opt: InstallmentRow = {
        id: `opt-${Date.now()}`,
        name: fd.get("name") as string,
        category: (fd.get("category") as string) || "Cuotas",
        total: totalAmount,
        paid: paidInstallments * monthlyAmount,
        remaining: totalInstallments - paidInstallments,
        total_installments: totalInstallments,
        monthly: monthlyAmount,
        next_due: nextDue,
      };

      qc.setQueryData<InstallmentRow[]>(qk.installments, (old) => old ? [...old, opt] : [opt]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk.installments, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["installments"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function usePayInstallment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payInstallment(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["installments"] });
      const prev = snapshot<InstallmentRow[]>(qc, qk.installments);

      qc.setQueryData<InstallmentRow[]>(qk.installments, (old) =>
        old?.map(i => {
          if (i.id !== id) return i;
          const newRemaining = Math.max(0, i.remaining - 1);
          const paidCount = i.total_installments - newRemaining;
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          return {
            ...i,
            remaining: newRemaining,
            paid: paidCount * i.monthly,
            next_due: nextMonth.toLocaleDateString("es-AR", { month: "short", day: "numeric" }),
          };
        })
      );

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk.installments, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["installments"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteInstallment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInstallment(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["installments"] });
      const prev = snapshot<InstallmentRow[]>(qc, qk.installments);
      qc.setQueryData<InstallmentRow[]>(qk.installments, (old) => old?.filter(i => i.id !== id));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk.installments, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["installments"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateInstallment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; name: string; monthlyAmount: number; paidInstallments: number; category?: string }) =>
      updateInstallment(vars.id, { name: vars.name, monthlyAmount: vars.monthlyAmount, paidInstallments: vars.paidInstallments, category: vars.category }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["installments"] });
      const prev = snapshot<InstallmentRow[]>(qc, qk.installments);
      qc.setQueryData<InstallmentRow[]>(qk.installments, (old) =>
        old?.map(i => {
          if (i.id !== vars.id) return i;
          const newRemaining = i.total_installments - vars.paidInstallments;
          return {
            ...i,
            name: vars.name,
            monthly: vars.monthlyAmount,
            remaining: newRemaining,
            paid: vars.paidInstallments * vars.monthlyAmount,
            ...(vars.category !== undefined && { category: vars.category }),
          };
        })
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk.installments, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["installments"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Recurring
// ---------------------------------------------------------------------------

const FREQ_DAYS: Record<string, number> = { weekly: 7, monthly: 30, bimonthly: 60, yearly: 365 };

export function useCreateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) => createRecurring(fd),
    onMutate: async (fd) => {
      await qc.cancelQueries({ queryKey: ["recurring"] });
      const prev = snapshot<RecurringRow[]>(qc, qk.recurring);

      const frequency = (fd.get("frequency") as string) || "monthly";
      const dayOfMonthRaw = fd.get("dayOfMonth") as string;
      const dayOfMonth = dayOfMonthRaw ? parseInt(dayOfMonthRaw) : null;
      const now = new Date();
      let nextMs: number;
      if (dayOfMonth && frequency === "monthly") {
        let d = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
        if (d <= now) d = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
        nextMs = d.getTime();
      } else {
        nextMs = now.getTime() + (FREQ_DAYS[frequency] ?? 30) * 86400000;
      }

      const opt: RecurringRow = {
        id: `opt-${Date.now()}`,
        name: fd.get("name") as string,
        amount: parseFloat(fd.get("amount") as string) || 0,
        category: fd.get("category") as string,
        frequency: frequency as RecurringRow["frequency"],
        dayOfMonth,
        nextDueDate: new Date(nextMs).toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
        nextDueDateMs: nextMs,
        paused: false,
        blockId: undefined,
        note: undefined,
        paidThisPeriod: false,
      };

      qc.setQueryData<RecurringRow[]>(qk.recurring, (old) =>
        old ? [...old, opt].sort((a, b) => a.nextDueDateMs - b.nextDueDateMs) : [opt]
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk.recurring, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["recurring"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function usePayRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markRecurringPaid(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["recurring"] });
      const prev = snapshot<RecurringRow[]>(qc, qk.recurring);

      qc.setQueryData<RecurringRow[]>(qk.recurring, (old) =>
        old?.map(r => {
          if (r.id !== id) return r;
          const advanceDays = FREQ_DAYS[r.frequency] ?? 30;
          let nextMs: number;
          if (r.dayOfMonth && r.frequency === "monthly") {
            const d = new Date(r.nextDueDateMs);
            d.setMonth(d.getMonth() + 1);
            nextMs = d.getTime();
          } else {
            nextMs = r.nextDueDateMs + advanceDays * 86400000;
          }
          return {
            ...r,
            nextDueDateMs: nextMs,
            nextDueDate: new Date(nextMs).toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
            paidThisPeriod: true,
          };
        })
      );

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk.recurring, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["recurring"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRecurring(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["recurring"] });
      const prev = snapshot<RecurringRow[]>(qc, qk.recurring);
      qc.setQueryData<RecurringRow[]>(qk.recurring, (old) => old?.filter(r => r.id !== id));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk.recurring, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["recurring"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function usePauseRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleRecurringPause(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["recurring"] });
      const prev = snapshot<RecurringRow[]>(qc, qk.recurring);
      qc.setQueryData<RecurringRow[]>(qk.recurring, (old) =>
        old?.map(r => r.id === id ? { ...r, paused: !r.paused } : r)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk.recurring, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["recurring"] });
    },
  });
}

export function useUpdateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; data: { name: string; amount: number; category: string; frequency: string; dayOfMonth: number | null; note: string | null } }) =>
      updateRecurring(vars.id, vars.data),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["recurring"] });
      const prev = snapshot<RecurringRow[]>(qc, qk.recurring);
      const freqDays: Record<string, number> = { weekly: 7, monthly: 30, bimonthly: 60, yearly: 365 };
      let nextMs: number;
      if (vars.data.dayOfMonth && vars.data.frequency === "monthly") {
        const now = new Date();
        let d = new Date(now.getFullYear(), now.getMonth(), vars.data.dayOfMonth);
        if (d <= now) d = new Date(now.getFullYear(), now.getMonth() + 1, vars.data.dayOfMonth);
        nextMs = d.getTime();
      } else {
        nextMs = Date.now() + (freqDays[vars.data.frequency] ?? 30) * 86400000;
      }
      qc.setQueryData<RecurringRow[]>(qk.recurring, (old) =>
        old?.map(r => {
          if (r.id !== vars.id) return r;
          return {
            ...r,
            name: vars.data.name,
            amount: vars.data.amount,
            category: vars.data.category,
            frequency: vars.data.frequency as RecurringRow["frequency"],
            dayOfMonth: vars.data.dayOfMonth,
            note: vars.data.note ?? undefined,
            nextDueDateMs: nextMs,
            nextDueDate: new Date(nextMs).toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
          };
        })
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk.recurring, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["recurring"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Blocks
// ---------------------------------------------------------------------------

export function useCreateBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) => createBlock(fd),
    onMutate: async (fd) => {
      await qc.cancelQueries({ queryKey: ["blocks"] });
      const prev = snapshot<BlockRow[]>(qc, qk.blocks);
      const opt: BlockRow = {
        id: `opt-${Date.now()}`,
        name: fd.get("name") as string,
        icon: (fd.get("icon") as string) || "Home",
        budget: parseFloat(fd.get("budget") as string) || 0,
        spent: 0,
        color: "",
        expenses: 0,
        goal: (fd.get("goal") as string) || "",
      };
      qc.setQueryData<BlockRow[]>(qk.blocks, (old) => old ? [...old, opt] : [opt]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk.blocks, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["blocks"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fd }: { id: string; fd: FormData }) => updateBlock(id, fd),
    onMutate: async ({ id, fd }) => {
      await qc.cancelQueries({ queryKey: ["blocks"] });
      const prev = snapshot<BlockRow[]>(qc, qk.blocks);

      qc.setQueryData<BlockRow[]>(qk.blocks, (old) =>
        old?.map(b => {
          if (b.id !== id) return b;
          return {
            ...b,
            name: fd.get("name") as string,
            icon: fd.get("icon") as string,
            budget: parseFloat(fd.get("budget") as string) || 0,
            goal: (fd.get("goal") as string) || "",
          };
        })
      );

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk.blocks, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["blocks"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useArchiveBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveBlock(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["blocks"] });
      const prev = snapshot<BlockRow[]>(qc, qk.blocks);
      qc.setQueryData<BlockRow[]>(qk.blocks, (old) => old?.filter(b => b.id !== id));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk.blocks, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["blocks"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUnarchiveBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unarchiveBlock(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["blocks"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) => createGoal(fd),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useContributeToGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) => contributeToGoal(fd),
    onMutate: async (fd) => {
      await qc.cancelQueries({ queryKey: ["goals"] });
      const prev = snapshot<GoalRow[]>(qc, qk.goals);

      const id = fd.get("id") as string;
      const amount = parseFloat(fd.get("amount") as string) || 0;

      qc.setQueryData<GoalRow[]>(qk.goals, (old) =>
        old?.map(g => {
          if (g.id !== id) return g;
          const newCurrent = g.currentAmount + amount;
          return {
            ...g,
            currentAmount: newCurrent,
            pct: g.targetAmount > 0 ? Math.min(100, Math.round((newCurrent / g.targetAmount) * 100)) : 0,
            remaining: Math.max(0, g.targetAmount - newCurrent),
          };
        })
      );

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk.goals, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["goals"] });
      const prev = snapshot<GoalRow[]>(qc, qk.goals);
      qc.setQueryData<GoalRow[]>(qk.goals, (old) => old?.filter(g => g.id !== id));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk.goals, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; name: string; targetAmount: number; deadline: string | null }) =>
      updateSavingsGoal(vars.id, { name: vars.name, targetAmount: vars.targetAmount, deadline: vars.deadline }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["goals"] });
      const prev = snapshot<GoalRow[]>(qc, qk.goals);
      qc.setQueryData<GoalRow[]>(qk.goals, (old) =>
        old?.map(g => {
          if (g.id !== vars.id) return g;
          const remaining = Math.max(0, vars.targetAmount - g.currentAmount);
          const pct = vars.targetAmount > 0
            ? Math.min(100, Math.round((g.currentAmount / vars.targetAmount) * 100))
            : 0;
          return { ...g, name: vars.name, targetAmount: vars.targetAmount, remaining, pct, deadlineISO: vars.deadline };
        })
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(qk.goals, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useBuyDollars() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) => buyDollars(fd),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.dollar });
      qc.invalidateQueries({ queryKey: qk.dollarBalance });
      qc.invalidateQueries({ queryKey: qk.stats });
      qc.invalidateQueries({ queryKey: qk.transactions });
    },
  });
}

export function useSellDollars() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) => sellDollars(fd),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.dollar });
      qc.invalidateQueries({ queryKey: qk.dollarBalance });
      qc.invalidateQueries({ queryKey: qk.stats });
      qc.invalidateQueries({ queryKey: qk.transactions });
    },
  });
}
