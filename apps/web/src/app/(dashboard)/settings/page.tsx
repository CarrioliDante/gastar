import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const user = await requireUser();
  const budgetSetting = await db.userSetting.findUnique({
    where: { userId_key: { userId: user.id, key: "monthlyBudget" } },
    select: { value: true },
  });
  const monthlyBudget = budgetSetting ? parseInt(budgetSetting.value, 10) || 5000 : 5000;
  return <SettingsClient email={user.email ?? ""} name={user.user_metadata?.name ?? ""} monthlyBudget={monthlyBudget} />;
}
