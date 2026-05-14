"use client";

import { create } from "zustand";
import type { Transaction } from "@gastar/shared";

interface OptimisticStore {
  transactions: (Transaction & { _optimistic: true })[];
  add: (tx: Omit<Transaction, "blockId" | "note"> & { category: string }) => void;
  flush: () => void;
}

let nextId = 0;

export const useOptimisticStore = create<OptimisticStore>(set => ({
  transactions: [],
  add: tx =>
    set(s => ({
      transactions: [
        { ...tx, id: `opt-${++nextId}`, _optimistic: true },
        ...s.transactions,
      ],
    })),
  flush: () => set({ transactions: [] }),
}));
