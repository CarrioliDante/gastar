import { requireUser } from "@/lib/dal";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const user = await requireUser();
  return <SettingsClient email={user.email ?? ""} name={user.user_metadata?.name ?? ""} />;
}
