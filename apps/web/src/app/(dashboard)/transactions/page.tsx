import { requireUser } from "@/lib/dal";
import { getAllTransactions } from "@/lib/queries/transactions";
import { Glyph, CATEGORY_GLYPH } from "@/components/ui/glyph";
import { deleteTransaction } from "@/app/actions/transactions";

function PageShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px 80px", display: "flex", flexDirection: "column" }}>
      <header style={{ paddingBottom: 28, borderBottom: "1px solid var(--hairline)" }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
          {subtitle}
        </div>
        <h1 className="display" style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em", color: "var(--ink)", lineHeight: 1 }}>
          {title}
        </h1>
      </header>
      {children}
    </div>
  );
}

export default async function TransactionsPage() {
  const user = await requireUser();
  const transactions = await getAllTransactions(user.id);

  // Group by date label
  const groups = transactions.reduce<Record<string, typeof transactions>>((acc, tx) => {
    (acc[tx.date] ||= []).push(tx);
    return acc;
  }, {});

  return (
    <PageShell title="Movimientos" subtitle="Historial completo">
      {transactions.length === 0 ? (
        <div style={{ paddingTop: 48 }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>
            Sin movimientos todavía. Usá el botón Anotar para agregar el primero.
          </div>
        </div>
      ) : (
        <div style={{ paddingTop: 8 }}>
          {Object.entries(groups).map(([dateLabel, txs]) => (
            <div key={dateLabel} style={{ marginTop: 28 }}>
              <div className="mono" style={{
                fontSize: 9, color: "var(--faint)", letterSpacing: "0.16em",
                textTransform: "uppercase", paddingBottom: 10,
                borderBottom: "1px solid var(--hairline)",
              }}>
                {dateLabel}
              </div>
              {txs.map((tx) => (
                <form key={tx.id} action={deleteTransaction.bind(null, tx.id)}>
                  <div className="row-hover" style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 0",
                    borderBottom: "1px solid var(--hairline)",
                  }}>
                    <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Glyph kind={CATEGORY_GLYPH[tx.category] ?? "circle"} size={14} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em" }}>
                        {tx.name}
                      </div>
                      <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 3 }}>
                        {tx.category} · {tx.time}
                      </div>
                    </div>

                    <div className="display tnum" style={{
                      fontSize: 14, fontWeight: 500, flexShrink: 0,
                      color: tx.amount >= 0 ? "var(--ink)" : "var(--mute)",
                      letterSpacing: "-0.02em",
                    }}>
                      {tx.amount >= 0 ? "+" : "−"}${Math.abs(tx.amount).toFixed(2)}
                    </div>

                    <button type="submit" title="Eliminar" className="del-btn">
                      ×
                    </button>
                  </div>
                </form>
              ))}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
