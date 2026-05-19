import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { getCustomCategories } from "@/lib/custom-categories";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const user = await requireUser();
  const [budgetSetting, cats] = await Promise.all([
    db.userSetting.findUnique({
      where: { userId_key: { userId: user.id, key: "monthlyBudget" } },
      select: { value: true },
    }),
    getCustomCategories(user.id),
  ]);
  const monthlyBudget = budgetSetting ? parseInt(budgetSetting.value, 10) || 5000 : 5000;
  return (
    <SettingsClient
      email={user.email ?? ""}
      name={user.user_metadata?.name ?? ""}
      monthlyBudget={monthlyBudget}
      customCategories={cats}
    />
  );
}
