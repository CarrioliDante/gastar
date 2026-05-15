import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { CalendarClient } from "./calendar-client";

export default async function CalendarPage() {
  const user = await requireUser();

  const horizon = new Date();
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
    ...installments.map(i => ({
      id: i.id,
      label: i.name,
      amount: -Number(i.monthlyAmount),
      date: i.nextDueDate,
      kind: "cuota" as const,
      category: "Tecnología",
    })),
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
