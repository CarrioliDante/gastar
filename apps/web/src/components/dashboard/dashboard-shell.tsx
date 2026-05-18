"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useUIStore } from "@/stores/ui";
import { useCurrency } from "@/hooks/use-currency";
import { useDashboardStats, useRecentTransactions, useInstallments, useBlocks, useRecurring } from "@/hooks/queries";
import { usePayInstallment, usePayRecurring } from "@/hooks/mutations";
import type { InstallmentRow, RecurringRow, BlockRow } from "@/hooks/queries";
import {
  BlockGlyph,
  Hairline,
  Eyebrow,
  TxRow,
  ListRow,
  Stat,
  type GlyphKind,
} from "@/components/ui/primitives";
import { CATEGORY_GLYPH } from "@/components/ui/glyph";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { RevealWords } from "@/components/motion/text-reveal";
import { springGentle } from "@/components/motion/presets";
import type { BalanceData, MonthlyStats, Category } from "@gastar/shared";

interface Props {
  userName: string;
  initialStats: Awaited<ReturnType<typeof import("@/lib/queries/stats").getDashboardStats>>;
  initialTransactions: Awaited<ReturnType<typeof import("@/lib/queries/transactions").getRecentTransactions>>;
  initialInstallments: InstallmentRow[];
  initialBlocks: BlockRow[];
  initialRecurring: RecurringRow[];
}

const BLOCK_GLYPHS: GlyphKind[] = ["Home", "Car", "Heart", "Coffee", "Briefcase", "Users"];

const FREQ_LABEL: Record<string, string> = {
  monthly:    "mensual",
  weekly:     "semanal",
  bimonthly:  "bimestral",
  yearly:     "anual",
};


function InstRow({ inst, isLast }: { inst: InstallmentRow; isLast: boolean }) {
  const pay = usePayInstallment();
  const { format: formatCurrency } = useCurrency();
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
            <BlockGlyph kind="Home" size={14} />
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
              {formatCurrency(inst.monthly, true)}
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
  const { format: formatCurrency } = useCurrency();
  const glyphKind: GlyphKind =
    (CATEGORY_GLYPH[r.category] as GlyphKind | undefined) ?? "Home";
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
            right={formatCurrency(r.amount, true)}
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
  const { format: formatCurrency } = useCurrency();

  const { data: stats }              = useDashboardStats(initialStats);
  const { data: transactions }        = useRecentTransactions(initialTransactions);
  const { data: installments }        = useInstallments(initialInstallments);
  const { data: blocks }              = useBlocks(initialBlocks);
  const { data: recurring }           = useRecurring(initialRecurring);

  const balance      = stats?.balance ?? { total: 0, currency: "USD", change: 0 } as BalanceData;
  const monthly      = stats?.monthly ?? { income: 0, spending: 0, savings: 0, savingsGoal: 5000 } as MonthlyStats;
  const categories   = stats?.categories ?? [] as Category[];
  const spendingTrend = stats?.spendingTrend ?? [];
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Buen día" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1);

  const currentMonthName = new Date().toLocaleDateString("es-AR", { month: "long" });
  const currentMonthCap  = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  const monthBudget  = monthly.savingsGoal > 0 ? monthly.savingsGoal : monthly.spending || 1;
  const monthPctRaw  = monthly.spending / monthBudget;
  const monthPct     = Math.min(1, monthPctRaw);
  const isOverBudget = monthPctRaw > 1;
  const overBy       = isOverBudget ? monthly.spending - monthBudget : 0;

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
          <motion.div
            className="mono"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springGentle, delay: 0.05 }}
            style={{
              fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em",
              textTransform: "uppercase", marginBottom: 8,
            }}
          >
            {todayCap}
          </motion.div>
          <h1 className="display" style={{
            margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em",
            color: "var(--ink)", lineHeight: 1,
          }}>
            <RevealWords stagger={0.04} delay={0.1}>
              {`${greeting}, ${userName}`}
            </RevealWords>
          </h1>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.3 }}
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <motion.button
            onClick={() => openCapture("expense")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "7px 12px 7px 9px", borderRadius: 8,
              background: "var(--ink)", color: "var(--inverse)", border: "none",
              fontFamily: "inherit", fontSize: 12, fontWeight: 500,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11">
              <line x1="5.5" y1="2" x2="5.5" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="2" y1="5.5" x2="9" y2="5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span>Anotar</span>
            <span className="kbd" style={{
              background: "rgba(255,255,255,0.1)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
              color: "inherit",
            }}>⌘N</span>
          </motion.button>
        </motion.div>
      </header>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 40px 100px" }}>

        {/* ── Hero balance ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.4 }}
          style={{ paddingTop: 52 }}
        >
          <Eyebrow>Balance total</Eyebrow>
          <div style={{ marginTop: 20 }}>
            <span className="display tnum" style={{
              fontSize: 96, fontWeight: 500, letterSpacing: "-0.05em", lineHeight: 0.92, color: "var(--ink)",
            }}>
              <AnimatedNumber value={balance.total} decimals={2} />
            </span>
          </div>
        </motion.div>

        <div style={{ borderTop: "1px solid var(--hairline)", marginTop: 40 }} />

        {/* ── Este mes ── */}
        <ScrollReveal direction="up" distance={24}>
          <div style={{ paddingTop: 48 }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 24 }}>
              Este mes · {currentMonthCap}
            </div>

            {/* Gastado — prominent with progress bar */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Gastado
                </div>
                {isOverBudget && (
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink)", letterSpacing: "0.06em", fontWeight: 500 }}>
                    +{formatCurrency(overBy, true)} sobre el presupuesto
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
                <div className="display tnum" style={{ fontSize: 48, fontWeight: 500, letterSpacing: "-0.05em", color: "var(--ink)", lineHeight: 1, display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span>{formatCurrency(monthly.spending, true)}</span>
                  <span style={{ color: "var(--faint)", fontSize: 20, fontWeight: 400, display: "flex", alignItems: "baseline", gap: 4 }}>
                    / {formatCurrency(monthBudget, true)}
                  </span>
                </div>
                <Link
                  href="/settings"
                  title="Configurar presupuesto mensual"
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "flex-end",
                    textDecoration: "none", cursor: "pointer",
                  }}
                >
                  <div className="display tnum" style={{
                    fontSize: 32, fontWeight: 500, letterSpacing: "-0.03em",
                    color: "var(--ink)",
                  }}>
                    {Math.round(monthPctRaw * 100)}%
                  </div>
                  <div className="mono" style={{ fontSize: 8, color: "var(--faint)", letterSpacing: "0.1em", marginTop: 4 }}>
                    PRESUPUESTO →
                  </div>
                </Link>
              </div>
              <div style={{ height: 6, background: "var(--hairline2)", borderRadius: 99, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${monthPct * 100}%` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: "100%", background: isOverBudget ? "var(--ink)" : "var(--ink)", borderRadius: 99 }}
                />
              </div>
            </div>

            {/* 4 stat cards */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } } }}
              style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}
            >
              {[
                { value: monthly.income, label: "Ingreso", suffix: "" },
                { value: monthly.savings, label: "Ahorrado", suffix: "" },
              ].map(s => (
                <motion.div key={s.label} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: springGentle } }}>
                  <Stat value={s.value} label={s.label} size={28} suffix={s.suffix} />
                </motion.div>
              ))}
            </motion.div>

            {/* Category breakdown — where spending goes */}
            {categories.length > 0 && blockList.length === 0 && (
              <div style={{ marginTop: 32 }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>
                  A dónde van los gastos
                </div>
                <CategoryBreakdown categories={categories} />
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* ── Two columns: Bloques + Compromisos ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 40, marginTop: 48 }}>

          {/* LEFT: Bloques de vida — horizontal cards */}
          <div>
            <div style={{
              display: "flex", alignItems: "baseline", justifyContent: "space-between",
              marginBottom: 16,
            }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                Bloques de vida
              </div>
              {blockList.length > 0 && (
                <Link href="/blocks" style={{ cursor: "pointer", color: "var(--ink)", textDecoration: "none" }}>
                  <span className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.08em" }}>
                    {blockList.length} activos →
                  </span>
                </Link>
              )}
            </div>

            {blockList.length === 0 ? (
              <div style={{ padding: "16px 0", borderTop: "1px solid var(--hairline)", textAlign: "center" }}>
                <div className="body-font" style={{ fontSize: 14, color: "var(--mute)", letterSpacing: "-0.005em", marginBottom: 8 }}>
                  Sin bloques
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.04em", marginBottom: 16 }}>
                  Creá bloques de presupuesto para organizar tus gastos.
                </div>
                <Link href="/blocks" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "9px 18px 9px 14px", borderRadius: 8,
                  background: "var(--ink)", color: "var(--inverse)", border: "none",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 500,
                  cursor: "pointer", textDecoration: "none",
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Crear bloque
                </Link>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
                style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid var(--hairline)" }}
              >
                {blockList.slice(0, 4).map((block, i) => {
                  const pct = block.budget > 0 ? Math.min(1, block.spent / block.budget) : 0;
                  const glyphKind: GlyphKind = BLOCK_GLYPHS[i % BLOCK_GLYPHS.length];
                  return (
                    <motion.div
                      key={block.id}
                      variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: springGentle } }}
                      style={{ borderBottom: "1px solid var(--hairline)" }}
                    >
                      <Link href={`/blocks/${block.id}`} style={{
                        display: "flex", alignItems: "flex-start", gap: 16,
                        padding: "14px 0", cursor: "pointer", textDecoration: "none",
                      }} className="row-hover">
                        <BlockGlyph kind={glyphKind} size={22} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                            <div className="body-font" style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em" }}>
                              {block.name}
                            </div>
                            <span className="mono tnum" style={{ fontSize: 11, color: "var(--ink)", letterSpacing: "0.04em", fontWeight: 500 }}>
                              {Math.round(pct * 100)}%
                            </span>
                          </div>
                          {block.goal && (
                            <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.04em", marginBottom: 10 }}>
                              {block.goal}
                            </div>
                          )}
                          <div style={{ height: 3, background: "var(--hairline2)", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
                            <motion.div
                              initial={{ width: "0%" }}
                              animate={{ width: `${pct * 100}%` }}
                              transition={{ duration: 1.0, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                              style={{ height: "100%", background: "var(--ink)", borderRadius: 99 }}
                            />
                          </div>
                          <div className="tnum mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.04em" }}>
                            {formatCurrency(block.spent, true)} / {formatCurrency(block.budget, true)} · {block.expenses} mov
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Gasto mensual — bar chart */}
            <div style={{ marginTop: 40 }}>
              <div style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between",
                marginBottom: 16,
              }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  Gasto mensual
                </div>
              </div>
              {spendingTrend.length > 0 ? (() => {
                const max = Math.max(...spendingTrend.map(x => x.amount), 1);
                return (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 88 }}>
                    {spendingTrend.map((p, i) => {
                      const h = Math.max(8, (p.amount / max) * 72);
                      const isLast = i === spendingTrend.length - 1;
                      return (
                        <div key={p.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                          <span className="mono tnum" style={{
                            fontSize: 9, color: isLast ? "var(--ink)" : "var(--faint)",
                            letterSpacing: "0.04em", fontWeight: isLast ? 500 : 400,
                          }}>
                            {formatCurrency(p.amount, true)}
                          </span>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: h }}
                            transition={{ duration: 0.7, delay: 0.5 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                              width: "100%", maxWidth: 28, borderRadius: 3,
                              background: isLast ? "var(--ink)" : "var(--hairline)",
                              marginTop: "auto",
                            }}
                          />
                          <span className="mono" style={{
                            fontSize: 9, color: isLast ? "var(--mute)" : "var(--faint)", letterSpacing: "0.04em",
                          }}>
                            {p.month.slice(0, 3)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })() : (
                <div className="mono" style={{ fontSize: 11, color: "var(--faint)", padding: "20px 0", textAlign: "center" }}>
                  Sin datos aún
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Compromisos — Cuotas + Recurrentes stacked */}
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {/* Cuotas activas */}
            <div>
              <div style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between",
                marginBottom: 16,
              }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  Cuotas
                </div>
                <Link href="/installments" style={{ cursor: "pointer", color: "var(--ink)", textDecoration: "none" }}>
                  <span className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.08em" }}>
                    {instList.length} activas →
                  </span>
                </Link>
              </div>
              {instList.length === 0 ? (
                <div style={{ padding: "16px 0", textAlign: "center" }}>
                  <div className="body-font" style={{ fontSize: 14, color: "var(--mute)", letterSpacing: "-0.005em", marginBottom: 8 }}>
                    Sin cuotas activas
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.04em", marginBottom: 14 }}>
                    Registrá compras en cuotas para hacerles seguimiento.
                  </div>
                  <Link href="/installments" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "8px 16px 8px 12px", borderRadius: 8,
                    background: "var(--surface)", color: "var(--ink)", border: "none",
                    fontFamily: "inherit", fontSize: 12, fontWeight: 500,
                    cursor: "pointer", textDecoration: "none",
                    boxShadow: "inset 0 0 0 1px var(--hairline)",
                  }}>
                    Ver cuotas →
                  </Link>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } } }}
                >
                  {instList.slice(0, 4).map((inst, i, arr) => (
                    <motion.div
                      key={inst.id}
                      variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: springGentle } }}
                    >
                      <InstRow inst={inst} isLast={i === arr.length - 1} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Recurrentes próximos */}
            <div>
              <div style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between",
                marginBottom: 16,
              }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  Recurrentes
                </div>
                <Link href="/recurring" style={{ cursor: "pointer", color: "var(--ink)", textDecoration: "none" }}>
                  <span className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.08em" }}>
                    {(recurring ?? []).length} activos →
                  </span>
                </Link>
              </div>
              {recurringByDue.length === 0 ? (
                <div style={{ padding: "16px 0", textAlign: "center" }}>
                  <div className="body-font" style={{ fontSize: 14, color: "var(--mute)", letterSpacing: "-0.005em", marginBottom: 8 }}>
                    Sin gastos recurrentes
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.04em", marginBottom: 14 }}>
                    Registrá suscripciones, alquiler o servicios que se repiten.
                  </div>
                  <Link href="/recurring" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "8px 16px 8px 12px", borderRadius: 8,
                    background: "var(--surface)", color: "var(--ink)", border: "none",
                    fontFamily: "inherit", fontSize: 12, fontWeight: 500,
                    cursor: "pointer", textDecoration: "none",
                    boxShadow: "inset 0 0 0 1px var(--hairline)",
                  }}>
                    Ver recurrentes →
                  </Link>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.14 } } }}
                >
                  {recurringByDue.map((r, i, arr) => (
                    <motion.div
                      key={r.id}
                      variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: springGentle } }}
                    >
                      <RecRow r={r} isLast={i === arr.length - 1} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* ── Hoy ── */}
        <div style={{ marginTop: 48 }}>
          <div style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between",
            marginBottom: 16,
          }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Hoy · {txList.length} {txList.length === 1 ? "movimiento" : "movimientos"}
            </div>
            <Link href="/transactions" style={{ cursor: "pointer", color: "var(--ink)", textDecoration: "none" }}>
              <span className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.08em" }}>Ver todo →</span>
            </Link>
          </div>
          {txList.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springGentle, delay: 0.3 }}
              style={{ padding: "32px 0", borderTop: "1px solid var(--hairline)" }}
            >
              <div className="body-font" style={{ fontSize: 14, color: "var(--mute)", letterSpacing: "-0.005em", marginBottom: 8 }}>
                Sin movimientos hoy
              </div>
              <div className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.04em", marginBottom: 16 }}>
                Usá el botón Anotar o el atajo ⌘N para agregar tu primer gasto o ingreso.
              </div>
              <motion.button
                onClick={() => openCapture("expense")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: "9px 18px 9px 14px", borderRadius: 8,
                  background: "var(--ink)", color: "var(--inverse)", border: "none",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 500,
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
                  letterSpacing: "-0.005em",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                Anotar movimiento
                <span className="kbd" style={{ background: "rgba(255,255,255,0.1)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)", color: "inherit" }}>⌘N</span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
              style={{ borderTop: "1px solid var(--hairline)" }}
            >
              {txList.slice(0, 8).map((tx, i, arr) => {
                const isOpt = tx.id.startsWith("opt-");
                const glyphKind: GlyphKind = (CATEGORY_GLYPH[tx.category] as GlyphKind | undefined) ?? "Home";
                return (
                  <motion.div
                    key={tx.id}
                    variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: isOpt ? 0.6 : 1, y: 0, transition: springGentle } }}
                  >
                    <TxRow tx={{ label: tx.name, glyph: glyphKind, meta: `${tx.category} · ${tx.date}`, amount: tx.amount }} />
                    {i < arr.length - 1 && <Hairline />}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
