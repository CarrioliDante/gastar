import "server-only";
import { db } from "@/lib/db";
import { userCache } from "@/lib/cache";

export function getActiveInstallments(userId: string) {
  return userCache(
    async () => {
      const rows = await db.installment.findMany({
        where: { userId, completedAt: null },
        orderBy: { nextDueDate: "asc" },
      });

      return rows.map(inst => ({
        id: inst.id,
        name: inst.name,
        total: Number(inst.totalAmount),
        paid: inst.paidInstallments * Number(inst.monthlyAmount),
        remaining: inst.totalInstallments - inst.paidInstallments,
        total_installments: inst.totalInstallments,
        monthly: Number(inst.monthlyAmount),
        next_due: inst.nextDueDate.toLocaleDateString("es-AR", { month: "short", day: "numeric" }),
      }));
    },
    userId,
    ["installments"],
  );
}
