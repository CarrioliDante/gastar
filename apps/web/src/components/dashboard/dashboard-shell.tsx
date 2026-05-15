"use client";

import Link from "next/link";
import { useUIStore } from "@/stores/ui";
import { useDashboardStats, useRecentTransactions, useInstallments, useBlocks, useRecurring } from "@/hooks/queries";
import { usePayInstallment, usePayRecurring } from "@/hooks/mutations";
import type { InstallmentRow, RecurringRow, BlockRow } from "@/hooks/queries";
import {
  BlockGlyph,
  RadialRing,
  LineChart,
  Hairline,
  Eyebrow,
  H2,
  TxRow,
  ListRow,
  Amount,
  Stat,
  type GlyphKind,
} from "@/components/ui/primitives";
import { CATEGORY_GLYPH } from "@/components/ui/glyph";
import type { BalanceData, MonthlyStats, SpendingPoint, Transaction } from "@gastar/shared";

interface Props {
  userName: string;
  initialStats: Awaited<ReturnType<typeof import("@/lib/queries/stats").getDashboardStats>>;
  initialTransactions: Awaited<ReturnType<typeof import("@/lib/queries/transactions").getRecentTransactions>>;
  initialInstallments: InstallmentRow[];
  initialBlocks: BlockRow[];
  initialRecurring: RecurringRow[];
}

const BLOCK_GLYPHS: GlyphKind[] = ["square", "circle", "arc", "diamond", "cross", "ring"];

const FREQ_LABEL: Record<string, string> = {
  monthly:    "mensual",
  weekly:     "semanal",
  bimonthly:  "bimestral",
  yearly:     "anual",
};

function fmtCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (abs / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1_000)     return (abs / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return abs.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function InstRow({ inst, isLast }: { inst: InstallmentRow; isLast: boolean }) {
  const pay = usePayInstallment();
  const paid = inst.total_installments - inst.remaining;
  const total = inst.total_installments;
  const isOpt = inst.id.startsWith("opt-");
  const isDone = inst.remaining === 0;

  return (
    <div>
      <div style={{ padding: "12px 0", opacity: isOpt ? 0.55 : 1 }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BlockGlyph kind="square" size={14} />
            <div>
              <div className="body-font" style={{
                fontSize: 13, fontWeight: 500, letterSpacing: "-0.005em", color: "var(--ink)",
              }}>
                {inst.name}
              </div>
              <div className="mono" style={{
                fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 2,
              }}>
                {paid}/{total} · {inst.next_due}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="tnum display" style={{
              fontSize: 13, fontWeight: 500, letterSpacing: "-0.015em", color: "var(--ink)",
            }}>
              {inst.monthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </div>
            {!isOpt && !isDone && (
              <button
                onClick={() => pay.mutate(inst.id)}
                disabled={pay.isPending}
                style={{
                  padding: "3px 9px", borderRadius: 5, border: "none", cursor: "pointer",
                  background: pay.isPending ? "var(--surface)" : "var(--hairline2)",
                  color: pay.isPending ? "var(--faint)" : "var(--ink)",
                  fontFamily: "inherit", fontSize: 10, fontWeight: 500,
                  letterSpacing: "-0.005em", whiteSpace: "nowrap",
                  transition: "all 120ms ease",
                }}
              >
                {pay.isPending ? "..." : "Pagar"}
              </button>
            )}
            {isDone && (
              <span className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em" }}>
                Completo
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {Array.from({ length: Math.min(total, 24) }).map((_, j) => (
            <div key={j} style={{
              flex: 1, height: 2, borderRadius: 99,
              background: j < paid ? "var(--ink)" : "var(--hairline2)",
            }} />
          ))}
        </div>
      </div>
      {!isLast && <Hairline />}
    </div>
  );
}

function RecRow({ r, isLast }: { r: RecurringRow; isLast: boolean }) {
  const pay = usePayRecurring();
  const glyphKind: GlyphKind =
    (CATEGORY_GLYPH[r.category] as GlyphKind | undefined) ?? "circle";
  const freqLabel = FREQ_LABEL[r.frequency] ?? r.frequency;
  const isOpt = r.id.startsWith("opt-");

  return (
    <div>
      <div style={{ opacity: isOpt ? 0.55 : 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ListRow
            glyph={glyphKind}
            label={r.name}
            meta={`${freqLabel} · próx ${r.nextDueDate}`}
            right={r.amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          />
          {!isOpt && (
            <button
              onClick={() => pay.mutate(r.id)}
              disabled={pay.isPending}
              style={{
                padding: "3px 9px", borderRadius: 5, border: "none", cursor: "pointer",
                background: pay.isPending ? "var(--surface)" : "var(--hairline2)",
                color: pay.isPending ? "var(--faint)" : "var(--ink)",
                fontFamily: "inherit", fontSize: 10, fontWeight: 500,
                letterSpacing: "-0.005em", whiteSpace: "nowrap",
                transition: "all 120ms ease", flexShrink: 0,
              }}
            >
              {pay.isPending ? "..." : "Pagar"}
            </button>
          )}
        </div>
      </div>
      {!isLast && <Hairline />}
    </div>
  );
}

export function DashboardShell({
  userName,
  initialStats,
  initialTransactions,
  initialInstallments,
  initialBlocks,
  initialRecurring,
}: Props) {
  const { openCapture } = useUIStore();

  const { data: stats }              = useDashboardStats(initialStats);
  const { data: transactions }        = useRecentTransactions(initialTransactions);
  const { data: installments }        = useInstallments(initialInstallments);
  const { data: blocks }              = useBlocks(initialBlocks);
  const { data: recurring }           = useRecurring(initialRecurring);

  const balance      = stats?.balance ?? { total: 0, currency: "USD", change: 0 } as BalanceData;
  const monthly      = stats?.monthly ?? { income: 0, spending: 0, savings: 0, savingsGoal: 5000 } as MonthlyStats;
  const categories   = stats?.categories ?? [];
  const spendingTrend = stats?.spendingTrend ?? [];
  const netWorth24mo = stats?.netWorth24mo ?? [0, 0];

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Buen día" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1);

  const currentMonthName = new Date().toLocaleDateString("es-AR", { month: "long" });
  const currentMonthCap  = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  const monthBudget = monthly.savingsGoal > 0 ? monthly.savingsGoal : monthly.spending || 1;
  const monthPct    = Math.min(1, monthly.spending / monthBudget);
  const available   = monthBudget - monthly.spending;

  const nw0     = netWorth24mo[0]  ?? 0;
  const nwLast  = netWorth24mo[netWorth24mo.length - 1] ?? 0;
  const nwPctChg = nw0 !== 0 ? Math.round((nwLast / nw0 - 1) * 100) : 0;

  const trendData = spendingTrend.map(p => p.amount);

  const savingsRate = monthly.income > 0 ? monthly.savings / monthly.income : 0;
  const pulso = Math.min(100, Math.max(0, Math.round(savingsRate * 100)));

  const recurringByDue = (recurring ?? [])
    .slice()
    .sort((a, b) => a.nextDueDateMs - b.nextDueDateMs)
    .slice(0, 5);

  const txList = transactions ?? [];
  const instList = installments ?? [];
  const blockList = blocks ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>

      {/* ── TopBar ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px 0", gap: 16, flexShrink: 0,
      }}>
        <div>
          <div className="mono" style={{
            fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em",
            textTransform: "uppercase", marginBottom: 8,
          }}>
            {todayCap}
          </div>
          <h1 className="display" style={{
            margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em",
            color: "var(--ink)", lineHeight: 1,
          }}>
            {greeting}, {userName}
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="mono" style={{
            fontSize: 10, color: "var(--mute)", letterSpacing: "0.12em", textTransform: "uppercase",
          }}>
            Sincronizado
          </span>
          <button onClick={() => openCapture("expense")} style={{
            padding: "7px 12px 7px 9px", borderRadius: 8,
            background: "var(--ink)", color: "var(--inverse)", border: "none",
            fontFamily: "inherit", fontSize: 12, fontWeight: 500,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
          }}>
            <svg width="11" height="11" viewBox="0 0 11 11">
              <line x1="5.5" y1="2" x2="5.5" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="2" y1="5.5" x2="9" y2="5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span>Anotar</span>
            <span className="kbd" style={{
              background: "rgba(255,255,255,0.1)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
              color: "inherit",
            }}>⌘N</span>
          </button>
        </div>
      </header>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 40px 100px" }}>

        {/* ── Hero balance ── */}
        <div style={{ paddingTop: 36 }}>
          <Eyebrow right="todas conectadas">Balance total</Eyebrow>
          <div style={{
            marginTop: 18, display: "flex", alignItems: "flex-end",
            justifyContent: "space-between", gap: 40,
          }}>
            <Amount value={balance.total} size={84} code="AR$" decimals={2} weight={500} />
            <div style={{ flex: 1, maxWidth: 360 }}>
              <div className="mono" style={{
                fontSize: 10, color: "var(--mute)", letterSpacing: "0.12em", marginBottom: 10,
              }}>
                PATRIMONIO · 24 MESES
              </div>
              <LineChart
                data={netWorth24mo.length >= 2 ? netWorth24mo : [0, 0]}
                width={360} height={42} stroke={1.1} dot={true} fill={false}
              />
              <div className="tnum" style={{
                display: "flex", justifyContent: "space-between", marginTop: 8,
                fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                color: "var(--faint)", letterSpacing: "0.06em",
              }}>
                <span>JUN 24</span>
                <span style={{ color: "var(--ink)" }}>
                  {nwPctChg >= 0 ? "+" : ""}{nwPctChg}% · MAY 26
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Account chips separator ── */}
        <div style={{ borderTop: "1px solid var(--hairline)", marginTop: 28 }} />

        {/* ── Este mes ── */}
        <H2 right={currentMonthCap}>Este mes</H2>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 32 }}>

          <div>
            <Stat value={monthly.spending} label="Gastado" size={32} decimals={0} />
            <div style={{
              marginTop: 14, height: 2, background: "var(--hairline)",
              borderRadius: 99, overflow: "hidden", position: "relative",
            }}>
              <div style={{
                position: "absolute", left: 0, top: 0, height: "100%",
                width: `${monthPct * 100}%`, background: "var(--ink)",
                transition: "width 1.4s cubic-bezier(.2,.7,.1,1)",
              }} />
            </div>
            <div className="mono" style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 8,
            }}>
              <span>{Math.round(monthPct * 100)}% del presupuesto</span>
              <span className="tnum">{fmtCompact(monthBudget)} max</span>
            </div>
          </div>

          <Stat value={available} label="Disponible" size={32} decimals={0} />
          <Stat value={monthly.income} label="Ingreso" size={32} decimals={0} />

          <div>
            <Stat value={pulso} suffix="/100" label="Pulso" size={32} />
          </div>
        </div>

        {/* ── Spending trend full-width ── */}
        {trendData.length >= 2 && (
          <div style={{ marginTop: 36 }}>
            <LineChart
              data={trendData}
              width={1020} height={64} stroke={1.2} dot={true} fill={true}
            />
            <div className="mono" style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 9, color: "var(--faint)", letterSpacing: "0.08em", marginTop: 10,
            }}>
              <span>{spendingTrend[0]?.month}</span>
              <span>{spendingTrend[Math.floor(spendingTrend.length / 2)]?.month}</span>
              <span style={{ color: "var(--ink)" }}>{spendingTrend[spendingTrend.length - 1]?.month} · HOY</span>
            </div>
          </div>
        )}

        {/* ── Bloques de vida ── */}
        {blockList.length > 0 && (
          <>
            <H2 right={
              <Link href="/blocks" style={{ cursor: "pointer", color: "var(--ink)", textDecoration: "none" }}>
                Ver todos · {blockList.length} →
              </Link>
            }>
              Bloques de vida
            </H2>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              gap: 0,
              borderTop: "1px solid var(--hairline)",
              borderBottom: "1px solid var(--hairline)",
            }}>
              {blockList.slice(0, 6).map((block, i) => {
                const pct = block.budget > 0 ? Math.min(1, block.spent / block.budget) : 0;
                const glyphKind: GlyphKind = BLOCK_GLYPHS[i % BLOCK_GLYPHS.length];
                return (
                  <Link key={block.id} href={`/blocks/${block.id}`} style={{
                    display: "block", padding: "22px 24px", cursor: "pointer",
                    textDecoration: "none",
                    borderRight: (i % 3 !== 2) ? "1px solid var(--hairline)" : "none",
                    borderBottom: (i < 3) ? "1px solid var(--hairline)" : "none",
                  }} className="row-hover">
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start", marginBottom: 16,
                    }}>
                      <BlockGlyph kind={glyphKind} size={22} />
                      <RadialRing value={pct} size={36} stroke={1.4} />
                    </div>
                    <div className="body-font" style={{
                      fontSize: 14, fontWeight: 500, letterSpacing: "-0.005em",
                      color: "var(--ink)", marginBottom: 4,
                    }}>
                      {block.name}
                    </div>
                    {block.goal && (
                      <div className="mono" style={{
                        fontSize: 10, color: "var(--mute)", letterSpacing: "0.06em", marginBottom: 12,
                      }}>
                        {block.goal}
                      </div>
                    )}
                    <div style={{
                      display: "flex", alignItems: "baseline", justifyContent: "space-between",
                    }}>
                      <div className="tnum display" style={{
                        fontSize: 18, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.025em",
                      }}>
                        {fmtCompact(block.spent)}
                        <span style={{ color: "var(--faint)", fontSize: 11, fontWeight: 400 }}>
                          {" "}/ {fmtCompact(block.budget)}
                        </span>
                      </div>
                      <span className="mono tnum" style={{
                        fontSize: 10, color: "var(--faint)", letterSpacing: "0.06em",
                      }}>
                        {block.expenses} mov
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* ── Two columns: Cuotas + Recurrentes ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginTop: 16 }}>

          {/* Cuotas activas */}
          <div>
            <H2 right={
              <Link href="/installments" style={{ cursor: "pointer", color: "var(--ink)", textDecoration: "none" }}>
                {instList.length} →
              </Link>
            }>
              Cuotas activas
            </H2>
            {instList.length === 0 ? (
              <div className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>Sin cuotas activas</div>
            ) : (
              <div>
                {instList.slice(0, 4).map((inst, i, arr) => (
                  <InstRow key={inst.id} inst={inst} isLast={i === arr.length - 1} />
                ))}
              </div>
            )}
          </div>

          {/* Recurrentes próximos */}
          <div>
            <H2 right={
              <Link href="/recurring" style={{ cursor: "pointer", color: "var(--ink)", textDecoration: "none" }}>
                {(recurring ?? []).length} →
              </Link>
            }>
              Recurrentes próximos
            </H2>
            {recurringByDue.length === 0 ? (
              <div className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>Sin recurrentes</div>
            ) : (
              <div>
                {recurringByDue.map((r, i, arr) => (
                  <RecRow key={r.id} r={r} isLast={i === arr.length - 1} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Hoy ── */}
        <H2 right={
          <Link href="/transactions" style={{ cursor: "pointer", color: "var(--ink)", textDecoration: "none" }}>
            Ver todo →
          </Link>
        }>
          Hoy
        </H2>
        {txList.length === 0 ? (
          <div className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>
            Sin movimientos — usá el botón Anotar para agregar el primero.
          </div>
        ) : (
          <div>
            {txList.slice(0, 8).map((tx, i, arr) => {
              const isOpt = tx.id.startsWith("opt-");
              const glyphKind: GlyphKind = (CATEGORY_GLYPH[tx.category] as GlyphKind | undefined) ?? "circle";
              return (
                <div key={tx.id} style={{ opacity: isOpt ? 0.6 : 1, transition: "opacity 400ms ease" }}>
                  <TxRow tx={{
                    label: tx.name,
                    glyph: glyphKind,
                    meta: `${tx.category} · ${tx.date}`,
                    amount: tx.amount,
                  }} />
                  {i < arr.length - 1 && <Hairline />}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
