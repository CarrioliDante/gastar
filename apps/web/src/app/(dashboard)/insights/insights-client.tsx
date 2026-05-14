"use client";

import { Glyph, CATEGORY_GLYPH } from "@/components/ui/glyph";
import type { MonthlyStats, SpendingPoint, Category, Transaction } from "@gastar/shared";

function MiniLineChart({ data, width = 600, height = 80, fill = false }: {
  data: number[]; width?: number; height?: number; fill?: boolean;
}) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pad = 6;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = pad + (height - pad * 2) * (1 - (d - min) / rng);
    return [x, y];
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} style={{ overflow: "visible", display: "block" }}>
      {fill && <path d={area} fill="var(--ink)" opacity={0.06} />}
      <path d={path} fill="none" stroke="var(--ink)" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={5} fill="var(--bg)" stroke="var(--ink)" strokeWidth={1} />
      <circle cx={last[0]} cy={last[1]} r={1.8} fill="var(--ink)" />
    </svg>
  );
}

function Eyebrow({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mono" style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase",
    }}>
      <span>{children}</span>
      {right && <span style={{ color: "var(--faint)", letterSpacing: "0.08em" }}>{right}</span>}
    </div>
  );
}

interface PulsoData {
  score: number;
  mood: string;
  components: { label: string; value: number; weight: number }[];
}

interface Props {
  monthly: MonthlyStats;
  spendingTrend: SpendingPoint[];
  categories: Category[];
  transactions: Transaction[];
  pulso: PulsoData;
}

function PulsoWidget({ pulso }: { pulso: PulsoData }) {
  const r = 40, c = 2 * Math.PI * r;
  return (
    <div style={{ padding: "28px 0 24px", borderBottom: "1px solid var(--hairline)" }}>
      <Eyebrow>Pulso Financiero</Eyebrow>
      <div style={{ marginTop: 20, display: "flex", gap: 32, alignItems: "center" }}>
        {/* Radial */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={90} height={90} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={45} cy={45} r={r} fill="none" stroke="var(--hairline2)" strokeWidth={2} />
            <circle cx={45} cy={45} r={r} fill="none" stroke="var(--ink)" strokeWidth={2}
              strokeLinecap="round" strokeDasharray={c}
              strokeDashoffset={c * (1 - pulso.score / 100)} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span className="display tnum" style={{ fontSize: 22, fontWeight: 500, color: "var(--ink)", lineHeight: 1 }}>{pulso.score}</span>
            <span className="mono" style={{ fontSize: 8, color: "var(--faint)", letterSpacing: "0.1em", marginTop: 2 }}>/100</span>
          </div>
        </div>

        {/* Components */}
        <div style={{ flex: 1 }}>
          <div className="display" style={{ fontSize: 18, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 16 }}>
            {pulso.mood}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pulso.components.map(comp => (
              <div key={comp.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "var(--mute)", letterSpacing: "-0.005em" }}>{comp.label}</span>
                  <span className="mono tnum" style={{ fontSize: 10, color: "var(--faint)" }}>{Math.round(comp.value * 100)}%</span>
                </div>
                <div style={{ height: 2, background: "var(--hairline)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${comp.value * 100}%`, background: "var(--ink)", opacity: 0.7, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", maxWidth: 180, lineHeight: 1.6 }}>
          Calculado en base a tasa de ahorro, adherencia al presupuesto, consistencia de registro y salud de cuotas.
        </div>
      </div>
    </div>
  );
}

export function InsightsClient({ monthly, spendingTrend, categories, transactions, pulso }: Props) {
  const totalSpending = categories.reduce((s, c) => s + c.amount, 0);
  const savingsRate = monthly.income > 0 ? Math.round((monthly.savings / monthly.income) * 100) : 0;

  // Income vs expense this month
  const incomeTotal = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenseTotal = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  // Top merchants (by frequency)
  const merchantFreq = transactions.reduce<Record<string, number>>((acc, t) => {
    if (t.amount < 0) acc[t.name] = (acc[t.name] || 0) + 1;
    return acc;
  }, {});
  const topMerchants = Object.entries(merchantFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px 80px" }}>
      <header style={{ paddingBottom: 28, borderBottom: "1px solid var(--hairline)" }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
          Análisis
        </div>
        <h1 className="display" style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em", color: "var(--ink)", lineHeight: 1 }}>
          Lectura
        </h1>
      </header>

      {/* Pulso */}
      <PulsoWidget pulso={pulso} />

      {/* Key stats */}
      <div style={{ paddingTop: 36, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
        {[
          { label: "Ingresos", value: monthly.income, prefix: "$" },
          { label: "Gastos", value: monthly.spending, prefix: "$" },
          { label: "Ahorrado", value: monthly.savings, prefix: "$" },
          { label: "Tasa de ahorro", value: savingsRate, suffix: "%" },
        ].map(stat => (
          <div key={stat.label}>
            <div className="display tnum" style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.04em", color: "var(--ink)", lineHeight: 1 }}>
              {stat.prefix && <span style={{ color: "var(--faint)", fontSize: 16 }}>{stat.prefix}</span>}
              {stat.prefix
                ? stat.value.toLocaleString("en-US", { maximumFractionDigits: 0 })
                : stat.value}
              {stat.suffix && <span style={{ color: "var(--faint)", fontSize: 16 }}>{stat.suffix}</span>}
            </div>
            <div className="mono" style={{ fontSize: 9, color: "var(--mute)", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 8 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Spending trend */}
      {spendingTrend.length > 1 && (
        <div style={{ marginTop: 48 }}>
          <Eyebrow right="6 meses">Tendencia de gastos</Eyebrow>
          <div style={{ marginTop: 18 }}>
            <MiniLineChart data={spendingTrend.map(p => p.amount)} width={960} height={80} fill />
            <div className="mono tnum" style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 10,
            }}>
              {spendingTrend.map(p => <span key={p.month}>{p.month}</span>)}
            </div>
          </div>
        </div>
      )}

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, marginTop: 52 }}>

        {/* Category breakdown */}
        <div>
          <Eyebrow right={totalSpending > 0 ? `$${totalSpending.toLocaleString("en-US")}` : undefined}>
            Por categoría
          </Eyebrow>
          {categories.length === 0 ? (
            <div className="mono" style={{ fontSize: 11, color: "var(--faint)", marginTop: 20 }}>Sin datos este mes</div>
          ) : (
            <div style={{ marginTop: 14 }}>
              {categories.map((cat, i) => (
                <div key={cat.name}>
                  {i > 0 && <div style={{ height: 1, background: "var(--hairline)" }} />}
                  <div style={{ padding: "14px 0", display: "flex", alignItems: "center", gap: 12 }}>
                    <Glyph kind={CATEGORY_GLYPH[cat.name] ?? "circle"} size={14} />
                    <span style={{ flex: 1, fontSize: 13, color: "var(--ink)", letterSpacing: "-0.005em" }}>{cat.name}</span>
                    <div style={{ width: 80, height: 2, background: "var(--hairline)", borderRadius: 99, overflow: "hidden", position: "relative" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${cat.percent}%`, background: "var(--ink)", opacity: 0.5, borderRadius: 99 }} />
                    </div>
                    <div className="mono tnum" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.06em", width: 32, textAlign: "right" }}>{cat.percent}%</div>
                    <div className="display tnum" style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.02em", width: 80, textAlign: "right" }}>
                      ${cat.amount.toLocaleString("en-US")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top merchants + income vs expense */}
        <div>
          <Eyebrow>Frecuencia de compra</Eyebrow>
          {topMerchants.length === 0 ? (
            <div className="mono" style={{ fontSize: 11, color: "var(--faint)", marginTop: 20 }}>Sin datos</div>
          ) : (
            <div style={{ marginTop: 14 }}>
              {topMerchants.map(([name, count], i) => (
                <div key={name}>
                  {i > 0 && <div style={{ height: 1, background: "var(--hairline)" }} />}
                  <div style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ flex: 1, fontSize: 13, color: "var(--ink)", letterSpacing: "-0.005em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {name}
                    </span>
                    <div className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.04em" }}>
                      ×{count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Income vs Expense bar */}
          {(incomeTotal > 0 || expenseTotal > 0) && (
            <div style={{ marginTop: 36 }}>
              <Eyebrow>Flujo del mes</Eyebrow>
              <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Ingresos", value: incomeTotal, total: Math.max(incomeTotal, expenseTotal) },
                  { label: "Gastos",   value: expenseTotal, total: Math.max(incomeTotal, expenseTotal) },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span className="mono" style={{ fontSize: 9, color: "var(--mute)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{row.label}</span>
                      <span className="display tnum" style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                        ${row.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div style={{ height: 3, background: "var(--hairline)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 99,
                        width: `${row.total > 0 ? (row.value / row.total) * 100 : 0}%`,
                        background: "var(--ink)",
                        transition: "width 1.2s cubic-bezier(.2,.7,.1,1)",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
