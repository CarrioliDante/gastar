import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { CalendarClient } from "./calendar-client";

export default async function CalendarPage() {
  const user = await requireUser();

  const now = new Date();
  const horizon = new Date(now);
  horizon.setMonth(horizon.getMonth() + 6);

  const [installments, recurring] = await Promise.all([
    db.installment.findMany({
      where: { userId: user.id, completedAt: null },
      orderBy: { nextDueDate: "asc" },
    }),
    db.recurringExpense.findMany({
      where: { userId: user.id, pausedAt: null },
      orderBy: { nextDueDate: "asc" },
    }),
  ]);

  const events = [
    ...installments.flatMap(i => {
      const evs: Array<{
        id: string; label: string; amount: number;
        date: Date; kind: "cuota"; category: string; paid: boolean;
      }> = [];
      for (let n = 0; n < i.totalInstallments; n++) {
        const date = new Date(i.startedAt);
        date.setMonth(date.getMonth() + n);
        const isPaid = n < i.paidInstallments;
        evs.push({
          id: `${i.id}-${n}`,
          label: `${i.name} (${n + 1}/${i.totalInstallments})`,
          amount: -Number(i.monthlyAmount),
          date,
          kind: "cuota" as const,
          category: "Cuotas",
          paid: isPaid,
        });
      }
      return evs;
    }),
    ...recurring.map(r => ({
      id: r.id,
      label: r.name,
      amount: -Number(r.amount),
      date: r.nextDueDate,
      kind: "recurrente" as const,
      category: r.category,
    })),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <CalendarClient events={events} />
    </div>
  );
}
