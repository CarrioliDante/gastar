import { requireUser } from "@/lib/dal";
import { getActiveInstallments } from "@/lib/queries/installments";
import { InstallmentsClient } from "./installments-client";

export default async function InstallmentsPage() {
  const user = await requireUser();
  const items = await getActiveInstallments(user.id);
  return <InstallmentsClient items={items} />;
}
