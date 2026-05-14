import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { getBlocks } from "@/lib/queries/blocks";
import { Glyph } from "@/components/ui/glyph";

export default async function BlocksPage() {
  const user = await requireUser();
  const blocks = await getBlocks(user.id);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px 80px" }}>
      <header style={{ paddingBottom: 28, borderBottom: "1px solid var(--hairline)" }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
          Organización
        </div>
        <h1 className="display" style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em", color: "var(--ink)", lineHeight: 1 }}>
          Bloques de vida
        </h1>
      </header>

      {blocks.length === 0 ? (
        <div style={{ paddingTop: 48 }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>
            Sin bloques todavía. Los bloques agrupan gastos por área de vida.
          </div>
        </div>
      ) : (
        <div style={{
          marginTop: 28,
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          borderTop: "1px solid var(--hairline)",
          borderLeft: "1px solid var(--hairline)",
        }}>
          {blocks.map((block) => {
            const pct = block.budget > 0 ? Math.min(1, block.spent / block.budget) : 0;
            const r = 16, c = 2 * Math.PI * r;
            const remaining = block.budget - block.spent;

            return (
              <Link
                key={block.id}
                href={`/blocks/${block.id}`}
                className="row-hover"
                style={{
                  display: "block",
                  textDecoration: "none", color: "inherit",
                  padding: "28px 28px 24px",
                  borderRight: "1px solid var(--hairline)",
                  borderBottom: "1px solid var(--hairline)",
                  cursor: "pointer",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <Glyph kind="square" size={20} />
                  <svg width={36} height={36} style={{ transform: "rotate(-90deg)" }}>
                    <circle cx={18} cy={18} r={r} fill="none" stroke="var(--hairline2)" strokeWidth={1.4} />
                    <circle cx={18} cy={18} r={r} fill="none" stroke="var(--ink)" strokeWidth={1.4}
                      strokeLinecap="round" strokeDasharray={c}
                      strokeDashoffset={c * (1 - pct)}
                      style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.2,.7,.1,1)" }} />
                  </svg>
                </div>

                {/* Name + goal */}
                <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em", color: "var(--ink)", marginBottom: 4 }}>
                  {block.name}
                </div>
                {block.goal && (
                  <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.04em", marginBottom: 20, lineHeight: 1.4 }}>
                    {block.goal}
                  </div>
                )}

                {/* Progress bar */}
                <div style={{ height: 2, background: "var(--hairline)", borderRadius: 99, overflow: "hidden", marginBottom: 20 }}>
                  <div style={{
                    height: "100%", width: `${pct * 100}%`,
                    background: "var(--ink)", opacity: pct > 0.9 ? 1 : 0.6,
                    borderRadius: 99,
                  }} />
                </div>

                {/* Amounts */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Gastado</div>
                    <div className="display tnum" style={{ fontSize: 20, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.03em" }}>
                      ${block.spent.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Disponible</div>
                    <div className="display tnum" style={{ fontSize: 20, fontWeight: 400, color: "var(--faint)", letterSpacing: "-0.03em" }}>
                      ${remaining.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.08em", marginTop: 14, display: "flex", justifyContent: "space-between" }}>
                  <span>{block.expenses} movimientos</span>
                  <span>{Math.round(pct * 100)}% del presupuesto</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
