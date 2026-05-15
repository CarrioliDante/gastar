"use client";

import { useUIStore } from "@/stores/ui";
import { QuickExpense } from "./quick-expense";

export function QuickExpenseGlobal() {
  const { captureType, closeCapture } = useUIStore();
  return (
    <QuickExpense
      open={!!captureType}
      initialType={captureType ?? "expense"}
      onClose={closeCapture}
    />
  );
}
