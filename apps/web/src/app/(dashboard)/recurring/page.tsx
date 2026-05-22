import { requireUser } from "@/lib/dal";
import { getRecurringExpenses } from "@/lib/queries/recurring";
import { getCustomCategories } from "@/lib/custom-categories";
import { RecurringClient } from "./recurring-client";

export default async function RecurringPage() {
  const user = await requireUser();
  const [items, cats] = await Promise.all([
    getRecurringExpenses(user.id),
    getCustomCategories(user.id),
  ]);
  const allCats = [...cats.expenses, ...cats.incomes];
  return <RecurringClient initialItems={items} customCategories={allCats} />;
}
