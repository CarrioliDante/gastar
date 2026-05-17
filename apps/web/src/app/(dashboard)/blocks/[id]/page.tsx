import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { Glyph, CATEGORY_GLYPH } from "@/components/ui/glyph";

function formatDate(d: Date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day   = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (day.getTime() === today.getTime()) return "Hoy";
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export default async function BlockDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const block = await db.block.findFirst({
    where: { id, userId: user.id, archivedAt: null },
    include: {
      transactions: { orderBy: { date: "desc" } },
    },
  });

  if (!block) notFound();

  const spent  = block.transactions.filter(t => Number(t.amount) < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const budget = Number(block.budget);
  const pct    = budget > 0 ? Math.min(1, spent / budget) : 0;
  const r = 28, c = 2 * Math.PI * r;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px 80px" }}>
      {/* Breadcrumb */}
      <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.12em", marginBottom: 20 }}>
        <Link href="/blocks" style={{ color: "inherit", textDecoration: "none" }}>Bloques</Link>
        {" · "}
        <span style={{ color: "var(--mute)" }}>{block.name}</span>
      </div>

      {/* Header */}
      <header style={{ paddingBottom: 28, borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "flex-end", gap: 28 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={64} height={64} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={32} cy={32} r={r} fill="none" stroke="var(--hairline2)" strokeWidth={1.6} />
            <circle cx={32} cy={32} r={r} fill="none" stroke="var(--ink)" strokeWidth={1.6}
              strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="display tnum" style={{ fontSize: 12, fontWeight: 500, color: "var(--ink)" }}>
              {Math.round(pct * 100)}%
            </span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h1 className="display" style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em", color: "var(--ink)", lineHeight: 1 }}>
            {block.name}
          </h1>
          {block.goal && (
            <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.06em" }}>{block.goal}</div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, flexShrink: 0 }}>
          {[
            { label: "Gastado",    value: spent },
            { label: "Disponible", value: budget - spent },
            { label: "Presupuesto",value: budget },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "right" }}>
              <div className="display tnum" style={{ fontSize: 22, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.035em" }}>
                ${stat.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
              <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Transactions */}
      <div style={{ marginTop: 28 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>
          {block.transactions.length} movimientos
        </div>

        {block.transactions.length === 0 ? (
          <div className="mono" style={{ fontSize: 11, color: "var(--faint)", padding: "24px 0" }}>
            Sin movimientos en este bloque todavía.
          </div>
        ) : (
          <div style={{ borderTop: "1px solid var(--hairline)" }}>
            {block.transactions.map(tx => (
              <div key={tx.id} className="row-hover" style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "13px 0", borderBottom: "1px solid var(--hairline)",
              }}>
                <div style={{ width: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Glyph kind={CATEGORY_GLYPH[tx.category] ?? "circle"} size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {tx.name}
                  </div>
                  <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 3 }}>
                    {tx.category} · {formatDate(tx.date)}
                  </div>
                </div>
                <div className="display tnum" style={{
                  fontSize: 14, fontWeight: 500, flexShrink: 0,
                  color: Number(tx.amount) >= 0 ? "var(--ink)" : "var(--mute)",
                  letterSpacing: "-0.02em",
                }}>
                  {Number(tx.amount) >= 0 ? "+" : "−"}{Math.abs(Number(tx.amount)).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
