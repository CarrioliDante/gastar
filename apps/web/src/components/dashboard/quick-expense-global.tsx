"use client";

import { useUIStore } from "@/stores/ui";
import { useCustomCategories } from "@/hooks/queries";
import { QuickExpense } from "./quick-expense";

export function QuickExpenseGlobal() {
  const { captureType, captureBlockId, closeCapture } = useUIStore();
  const { data: cats } = useCustomCategories();
  const allCats = cats ? [...cats.expenses, ...cats.incomes] : undefined;
  return (
    <QuickExpense
      open={!!captureType}
      initialType={captureType ?? "expense"}
      initialBlockId={captureBlockId ?? undefined}
      onClose={closeCapture}
      customCategories={allCats}
    />
  );
}
