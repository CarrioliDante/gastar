import { requireUser } from "@/lib/dal";
import { getSavingsGoals } from "@/lib/queries/goals";
import { GoalsClient } from "./goals-client";

export default async function GoalsPage() {
  const user = await requireUser();
  const goals = await getSavingsGoals(user.id);
  return <GoalsClient goals={goals} />;
}
