import { requireUser } from "@/lib/dal";
import { getRecurringExpenses } from "@/lib/queries/recurring";
import { RecurringClient } from "./recurring-client";

export default async function RecurringPage() {
  const user = await requireUser();
  const items = await getRecurringExpenses(user.id);
  return <RecurringClient initialItems={items} />;
}
