"use client";

import { useState } from "react";
import { QuickExpense } from "./quick-expense";
import { Glyph, CATEGORY_GLYPH } from "@/components/ui/glyph";
import { useCurrency } from "@/hooks/use-currency";
import { useOptimisticStore } from "@/stores/optimistic";
import type { BalanceData, MonthlyStats, SpendingPoint, Category, Transaction, Installment, Block } from "@gastar/shared";

interface Props {
  userName: string;
  balance: BalanceData;
  monthly: MonthlyStats;
  spendingTrend: SpendingPoint[];
  categories: Category[];
  transactions: Transaction[];
  installments: Installment[];
  blocks: Block[];
}

// ── Primitives ──────────────────────────────────────────────────
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

function Hairline({ style = {} }: { style?: React.CSSProperties }) {
  return <div style={{ height: 1, background: "var(--hairline)", ...style }} />;
}

function Stat({ value, label, size = 22, sign = false }: {
  value: number; label: string; size?: number; sign?: boolean;
}) {
  const { format } = useCurrency();
  const isNeg = value < 0;
  return (
    <div>
      <div className="display tnum" style={{
        fontSize: size, fontWeight: 500,
        letterSpacing: size > 30 ? "-0.04em" : "-0.025em",
        color: "var(--ink)", lineHeight: 1,
      }}>
        {sign && !isNeg && <span style={{ color: "var(--faint)" }}>+</span>}
        {isNeg && <span style={{ color: "var(--faint)" }}>−</span>}
        <span>{format(Math.abs(value), Math.abs(value) >= 10000)}</span>
      </div>
      <div className="mono" style={{
        fontSize: 9, color: "var(--mute)", letterSpacing: "0.16em",
        textTransform: "uppercase", marginTop: 8,
      }}>{label}</div>
    </div>
  );
}

// Simple SVG line chart
function MiniLineChart({ data, width = 220, height = 48, fill = false }: {
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
      <path d={path} fill="none" stroke="var(--ink)" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={5} fill="var(--bg)" stroke="var(--ink)" strokeWidth={1} />
      <circle cx={last[0]} cy={last[1]} r={1.6} fill="var(--ink)" />
    </svg>
  );
}

// ── Main shell ──────────────────────────────────────────────────
export function DashboardShell({ userName, balance, monthly, spendingTrend, categories, transactions, installments, blocks }: Props) {
  const [captureOpen, setCaptureOpen] = useState(false);
  const { format: fmtCurrency, symbol } = useCurrency();
  const optimisticTxs = useOptimisticStore(s => s.transactions);

  // Merge optimistic entries with server data (deduplicate by id prefix)
  const serverIds = new Set(transactions.map(t => t.id));
  const mergedTransactions = [
    ...optimisticTxs.filter(t => !serverIds.has(t.id)).map(t => ({ ...t, _optimistic: true as const })),
    ...transactions,
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const budgetPct = monthly.savingsGoal > 0 ? Math.min(1, monthly.spending / monthly.savingsGoal) : 0;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        {/* Top bar */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 40px 0", gap: 16, flexShrink: 0,
        }}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
              {today}
            </div>
            <h1 className="display" style={{
              margin: 0, fontSize: 26, fontWeight: 500, letterSpacing: "-0.03em",
              color: "var(--ink)", lineHeight: 1,
            }}>
              {greeting}, {userName}.
            </h1>
          </div>
          <button onClick={() => setCaptureOpen(true)} style={{
            padding: "8px 14px 8px 10px", borderRadius: 8,
            background: "var(--ink)", color: "var(--inverse)", border: "none",
            fontFamily: "inherit", fontSize: 12, fontWeight: 500,
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <svg width="11" height="11" viewBox="0 0 11 11">
              <line x1="5.5" y1="2" x2="5.5" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="2" y1="5.5" x2="9" y2="5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span>Anotar</span>
            <span className="kbd" style={{ background: "rgba(255,255,255,0.12)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)", color: "inherit" }}>⌘N</span>
          </button>
        </header>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 40px 80px" }}>

          {/* Hero balance */}
          <div style={{ paddingTop: 36 }}>
            <Eyebrow right="Balance total">Este mes</Eyebrow>
            <div style={{ marginTop: 18, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
              <div className="display tnum" style={{
                fontSize: 72, fontWeight: 500, letterSpacing: "-0.05em",
                color: "var(--ink)", lineHeight: 1,
              }}>
                {balance.total < 0 && <span style={{ color: "var(--faint)" }}>−</span>}
                {fmtCurrency(Math.abs(balance.total))}
              </div>

              {spendingTrend.length > 1 && (
                <div style={{ flex: 1, maxWidth: 320 }}>
                  <div className="mono" style={{ fontSize: 9, color: "var(--mute)", letterSpacing: "0.12em", marginBottom: 10 }}>
                    GASTO · 6 MESES
                  </div>
                  <MiniLineChart data={spendingTrend.map(p => p.amount)} width={320} height={40} fill />
                  <div className="tnum" style={{
                    display: "flex", justifyContent: "space-between", marginTop: 8,
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--faint)",
                  }}>
                    <span>{spendingTrend[0]?.month}</span>
                    <span style={{ color: "var(--ink)" }}>{spendingTrend[spendingTrend.length - 1]?.month} · HOY</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Monthly stats grid */}
          <div style={{ paddingTop: 28, marginTop: 28, borderTop: "1px solid var(--hairline)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 32 }}>
              <div>
                <Stat value={monthly.spending} label="Gastado" size={32} />
                <div style={{ marginTop: 14, height: 2, background: "var(--hairline)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${budgetPct * 100}%`,
                    background: "var(--ink)",
                    transition: "width 1.2s cubic-bezier(.2,.7,.1,1)",
                  }} />
                </div>
                <div className="mono tnum" style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 8,
                }}>
                  <span>{Math.round(budgetPct * 100)}% del mes</span>
                  <span>{monthLabel}</span>
                </div>
              </div>
              <Stat value={monthly.income}   label="Ingresos"  size={32} />
              <Stat value={monthly.savings}  label="Ahorros"   size={32} sign />
              <Stat value={installments.reduce((s, i) => s + i.monthly, 0)} label="Cuotas/mes" size={32} />
            </div>
          </div>

          {/* Spending trend full-width */}
          {spendingTrend.length > 1 && (
            <div style={{ marginTop: 32 }}>
              <MiniLineChart data={spendingTrend.map(p => p.amount)} width={900} height={56} fill />
            </div>
          )}

          {/* Blocks grid */}
          {blocks.length > 0 && (
            <div style={{ marginTop: 48 }}>
              <Eyebrow right={`${blocks.length} bloques`}>Bloques de vida</Eyebrow>
              <div style={{
                marginTop: 18,
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                borderTop: "1px solid var(--hairline)",
                borderLeft: "1px solid var(--hairline)",
              }}>
                {blocks.slice(0, 6).map((block) => {
                  const pct = block.budget > 0 ? Math.min(1, block.spent / block.budget) : 0;
                  const r = 16, c = 2 * Math.PI * r;
                  return (
                    <div key={block.id} className="row-hover" style={{
                      padding: "22px 24px", cursor: "pointer",
                      borderRight: "1px solid var(--hairline)",
                      borderBottom: "1px solid var(--hairline)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <Glyph kind="square" size={20} />
                        <svg width={36} height={36} style={{ transform: "rotate(-90deg)" }}>
                          <circle cx={18} cy={18} r={r} fill="none" stroke="var(--hairline2)" strokeWidth={1.4} />
                          <circle cx={18} cy={18} r={r} fill="none" stroke="var(--ink)" strokeWidth={1.4}
                            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
                        </svg>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.005em", color: "var(--ink)", marginBottom: 4 }}>
                        {block.name}
                      </div>
                      {block.goal && (
                        <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.04em", marginBottom: 12 }}>
                          {block.goal}
                        </div>
                      )}
                      <div className="display tnum" style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.025em", color: "var(--ink)" }}>
                        {fmtCurrency(block.spent, true)}
                        <span style={{ color: "var(--faint)", fontSize: 11, fontWeight: 400 }}>
                          {" "}/ {fmtCurrency(block.budget, true)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Two columns: Installments + Transactions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginTop: 48 }}>

            {/* Installments */}
            <div>
              <Eyebrow right={installments.length > 0 ? `${installments.length} activas` : undefined}>
                Cuotas
              </Eyebrow>
              {installments.length === 0 ? (
                <div className="mono" style={{ fontSize: 11, color: "var(--faint)", marginTop: 24 }}>Sin cuotas activas</div>
              ) : (
                <div style={{ marginTop: 14 }}>
                  {installments.slice(0, 5).map((inst, i) => {
                    const pct = (inst.total_installments - inst.remaining) / inst.total_installments;
                    return (
                      <div key={inst.id}>
                        {i > 0 && <Hairline />}
                        <div style={{ padding: "14px 0", display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em" }}>
                              {inst.name}
                            </div>
                            <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 4 }}>
                              {inst.total_installments - inst.remaining}/{inst.total_installments} · {inst.next_due}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div className="display tnum" style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>
                              {fmtCurrency(inst.monthly)}
                            </div>
                            <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 2 }}>
                              {Math.round(pct * 100)}% pagado
                            </div>
                          </div>
                        </div>
                        <div style={{ height: 2, background: "var(--hairline)", borderRadius: 99, overflow: "hidden", marginBottom: 2 }}>
                          <div style={{ height: "100%", width: `${pct * 100}%`, background: "var(--ink)" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Categories */}
            <div>
              <Eyebrow right={categories.length > 0 ? "Este mes" : undefined}>
                Por categoría
              </Eyebrow>
              {categories.length === 0 ? (
                <div className="mono" style={{ fontSize: 11, color: "var(--faint)", marginTop: 24 }}>Sin gastos este mes</div>
              ) : (
                <div style={{ marginTop: 14 }}>
                  {categories.slice(0, 6).map((cat, i) => (
                    <div key={cat.name}>
                      {i > 0 && <Hairline />}
                      <div style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 12 }}>
                        <Glyph kind={CATEGORY_GLYPH[cat.name] ?? "circle"} size={14} />
                        <span style={{ flex: 1, fontSize: 13, color: "var(--ink)", letterSpacing: "-0.005em" }}>{cat.name}</span>
                        <div className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.06em", marginRight: 12 }}>{cat.percent}%</div>
                        <div className="display tnum" style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>
                          {fmtCurrency(cat.amount)}
                        </div>
                      </div>
                      <div style={{ height: 1, background: "var(--hairline)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${cat.percent}%`, background: "var(--ink)", opacity: 0.35 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent transactions */}
          <div style={{ marginTop: 48 }}>
            <Eyebrow right={transactions.length > 0 ? <a href="/transactions" style={{ color: "var(--ink)", textDecoration: "none" }}>Ver todos →</a> : undefined}>
              Últimos movimientos
            </Eyebrow>
            {transactions.length === 0 ? (
              <div className="mono" style={{ fontSize: 11, color: "var(--faint)", marginTop: 24 }}>
                Sin movimientos — usá el botón Anotar para agregar el primero.
              </div>
            ) : (
              <div style={{ marginTop: 14, borderTop: "1px solid var(--hairline)" }}>
                {mergedTransactions.map((tx) => {
                  const pos = tx.amount >= 0;
                  const isOpt = "_optimistic" in tx && tx._optimistic;
                  return (
                    <div key={tx.id} className="row-hover" style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "13px 0",
                      borderBottom: "1px solid var(--hairline)",
                      opacity: isOpt ? 0.6 : 1,
                      transition: "opacity 400ms ease",
                    }}>
                      <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Glyph kind={CATEGORY_GLYPH[tx.category] ?? "circle"} size={14} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {tx.name}
                        </div>
                        <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 3 }}>
                          {tx.category} · {tx.date}
                        </div>
                      </div>
                      <div className="display tnum" style={{
                        fontSize: 14, fontWeight: 500,
                        color: pos ? "var(--ink)" : "var(--mute)",
                        letterSpacing: "-0.02em", flexShrink: 0,
                      }}>
                        {pos ? "+" : "−"}{fmtCurrency(Math.abs(tx.amount))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      <QuickExpense open={captureOpen} onClose={() => setCaptureOpen(false)} />
    </>
  );
}
