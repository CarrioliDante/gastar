"use client";

import { useUIStore } from "@/stores/ui";
import { QuickExpense } from "./quick-expense";

export function QuickExpenseGlobal() {
  const { captureType, captureBlockId, closeCapture } = useUIStore();
  return (
    <QuickExpense
      open={!!captureType}
      initialType={captureType ?? "expense"}
      initialBlockId={captureBlockId ?? undefined}
      onClose={closeCapture}
    />
  );
}
