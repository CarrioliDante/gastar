import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { Glyph, CATEGORY_GLYPH } from "@/components/ui/glyph";

type DueItem = {
  id: string;
  name: string;
  amount: number;
  date: Date;
  kind: "installment" | "recurring";
  category?: string;
  frequency?: string;
};

function daysUntil(d: Date) {
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function urgencyColor(days: number): string {
  if (days < 0)  return "var(--ink)";
  if (days <= 3) return "var(--ink)";
  return "var(--faint)";
}

function urgencyLabel(days: number): string {
  if (days < 0)  return "Vencido";
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  if (days <= 7)  return `En ${days} días`;
  return `${days}d`;
}

export default async function CalendarPage() {
  const user = await requireUser();

  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 90);

  const [installments, recurring] = await Promise.all([
    db.installment.findMany({
      where: { userId: user.id, completedAt: null, nextDueDate: { lte: horizon } },
      orderBy: { nextDueDate: "asc" },
    }),
    db.recurringExpense.findMany({
      where: { userId: user.id, pausedAt: null, nextDueDate: { lte: horizon } },
      orderBy: { nextDueDate: "asc" },
    }),
  ]);

  const items: DueItem[] = [
    ...installments.map(i => ({
      id: i.id, name: i.name,
      amount: Number(i.monthlyAmount),
      date: i.nextDueDate,
      kind: "installment" as const,
      category: "Cuotas",
    })),
    ...recurring.map(r => ({
      id: r.id, name: r.name,
      amount: Number(r.amount),
      date: r.nextDueDate,
      kind: "recurring" as const,
      category: r.category,
      frequency: r.frequency,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by month
  const groups = items.reduce<Record<string, DueItem[]>>((acc, item) => {
    const key = item.date.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    (acc[key] ||= []).push(item);
    return acc;
  }, {});

  const totalNext30 = items
    .filter(i => daysUntil(i.date) <= 30)
    .reduce((s, i) => s + i.amount, 0);

  const overdueCount = items.filter(i => daysUntil(i.date) < 0).length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px 80px" }}>
      <header style={{ paddingBottom: 28, borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
            Compromisos
          </div>
          <h1 className="display" style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em", color: "var(--ink)", lineHeight: 1 }}>
            Calendario
          </h1>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {overdueCount > 0 && (
            <div style={{ textAlign: "right" }}>
              <div className="display tnum" style={{ fontSize: 22, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.04em" }}>{overdueCount}</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", marginTop: 4 }}>VENCIDOS</div>
            </div>
          )}
          <div style={{ textAlign: "right" }}>
            <div className="display tnum" style={{ fontSize: 22, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.04em" }}>
              ${totalNext30.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </div>
            <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", marginTop: 4 }}>PRÓXIMOS 30 DÍAS</div>
          </div>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="mono" style={{ fontSize: 11, color: "var(--faint)", padding: "48px 0" }}>
          Sin vencimientos en los próximos 90 días. Agregá cuotas o recurrentes para verlos acá.
        </div>
      ) : (
        <div style={{ marginTop: 8 }}>
          {Object.entries(groups).map(([month, monthItems]) => (
            <div key={month} style={{ marginTop: 36 }}>
              <div className="mono" style={{
                fontSize: 9, color: "var(--faint)", letterSpacing: "0.18em",
                textTransform: "uppercase", paddingBottom: 12,
                borderBottom: "1px solid var(--hairline)",
              }}>{month}</div>

              {monthItems.map(item => {
                const days = daysUntil(item.date);
                const dayStr = item.date.toLocaleDateString("es-AR", { weekday: "short", day: "numeric" });
                return (
                  <div key={`${item.kind}-${item.id}`} className="row-hover" style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 0", borderBottom: "1px solid var(--hairline)",
                  }}>
                    {/* Date badge */}
                    <div style={{
                      width: 48, flexShrink: 0, textAlign: "center",
                      padding: "6px 8px", borderRadius: 8,
                      background: days <= 3 ? "var(--ink)" : "var(--surface)",
                      boxShadow: days > 3 ? "inset 0 0 0 1px var(--hairline)" : "none",
                    }}>
                      <div className="mono" style={{ fontSize: 8, color: days <= 3 ? "var(--inverse)" : "var(--faint)", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7 }}>
                        {dayStr.split(" ")[0]}
                      </div>
                      <div className="display tnum" style={{ fontSize: 18, fontWeight: 500, color: days <= 3 ? "var(--inverse)" : "var(--ink)", lineHeight: 1.1 }}>
                        {dayStr.split(" ")[1]}
                      </div>
                    </div>

                    {/* Glyph */}
                    <div style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Glyph kind={item.kind === "installment" ? "bar" : (CATEGORY_GLYPH[item.category ?? ""] ?? "ring")} size={14} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em" }}>{item.name}</div>
                      <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 3 }}>
                        {item.kind === "installment" ? "Cuota" : item.frequency}
                        {item.category ? ` · ${item.category}` : ""}
                      </div>
                    </div>

                    {/* Days pill */}
                    <div className="mono" style={{
                      fontSize: 10, letterSpacing: "0.06em",
                      color: urgencyColor(days),
                      fontWeight: days <= 3 ? 500 : 400,
                      flexShrink: 0,
                    }}>
                      {days < 0 ? `hace ${Math.abs(days)}d` : days === 0 ? "hoy" : days === 1 ? "mañana" : `en ${days}d`}
                    </div>

                    {/* Amount */}
                    <div className="display tnum" style={{
                      fontSize: 15, fontWeight: 500, color: "var(--ink)",
                      letterSpacing: "-0.025em", flexShrink: 0, minWidth: 80, textAlign: "right",
                    }}>
                      ${item.amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
