"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useUIStore } from "@/stores/ui";
import { useCurrency } from "@/hooks/use-currency";
import { useDashboardStats, useRecentTransactions, useInstallments, useBlocks, useRecurring, useGoals } from "@/hooks/queries";
import { usePayInstallment, usePayRecurring } from "@/hooks/mutations";
import type { InstallmentRow, RecurringRow, BlockRow, GoalRow } from "@/hooks/queries";
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
import { CandlestickChart } from "@/components/dashboard/candlestick-chart";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { RevealWords } from "@/components/motion/text-reveal";
import { springGentle } from "@/components/motion/presets";
import { Tooltip } from "@/components/ui/tooltip";

import type { BalanceData, MonthlyStats, Category } from "@gastar/shared";
import type { DolarRates } from "@/lib/dolar";

interface Props {
  userName: string;
  initialStats: Awaited<ReturnType<typeof import("@/lib/queries/stats").getDashboardStats>>;
  initialTransactions: Awaited<ReturnType<typeof import("@/lib/queries/transactions").getRecentTransactions>>;
  initialInstallments: InstallmentRow[];
  initialBlocks: BlockRow[];
  initialRecurring: RecurringRow[];
  initialGoals: GoalRow[];
  dolarRate?: DolarRates | null;
  usdBalance?: number;
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

  const monthAbbrs = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const currentMonthIdx = new Date().getMonth();
  const nextDueStr = inst.next_due.toLowerCase();
  let nextDueMonthIdx = -1;
  for (const abbr of monthAbbrs) {
    if (nextDueStr.startsWith(abbr)) {
      nextDueMonthIdx = monthAbbrs.indexOf(abbr);
      break;
    }
  }
  const paidThisPeriod = nextDueMonthIdx >= 0 && nextDueMonthIdx !== currentMonthIdx;

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
              <AnimatedNumber value={inst.monthly} prefix="$" />
            </div>
            {!isOpt && !isDone && !paidThisPeriod && (
              <button
                onClick={() => pay.mutate(inst.id)}
                disabled={pay.isPending}
                style={{
                  padding: "3px 6px", background: "none", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 10, letterSpacing: "0.04em",
                  color: "var(--mute)", borderBottom: "1px solid var(--hairline)",
                }}
              >
                {pay.isPending ? "..." : "Pagar"}
              </button>
            )}
            {!isOpt && !isDone && paidThisPeriod && (
              <span className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em" }}>
                Pagado
              </span>
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

  const monthAbbrs = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const currentMonthIdx = new Date().getMonth();
  const nextDueStr = r.nextDueDate.toLowerCase();
  let nextDueMonthIdx = -1;
  for (const abbr of monthAbbrs) {
    if (nextDueStr.startsWith(abbr)) {
      nextDueMonthIdx = monthAbbrs.indexOf(abbr);
      break;
    }
  }
  const paidThisPeriod = nextDueMonthIdx >= 0 && nextDueMonthIdx !== currentMonthIdx;

  return (
    <div>
      <div style={{ opacity: isOpt ? 0.55 : 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ListRow
            glyph={glyphKind}
            label={r.name}
            meta={`${freqLabel} · próx ${r.nextDueDate}`}
            right={<AnimatedNumber value={r.amount} prefix="$" />}
          />
          {!isOpt && !paidThisPeriod && (
            <button
              onClick={() => pay.mutate(r.id)}
              disabled={pay.isPending}
              style={{
                padding: "3px 6px", background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 10, letterSpacing: "0.04em",
                color: "var(--mute)", borderBottom: "1px solid var(--hairline)",
              }}
            >
              {pay.isPending ? "..." : "Pagar"}
            </button>
          )}
          {!isOpt && paidThisPeriod && (
            <span className="mono" style={{
              fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", flexShrink: 0,
            }}>
              Pagado
            </span>
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
  initialGoals,
  dolarRate,
  usdBalance,
}: Props) {
  const { openCapture } = useUIStore();
  const { format: formatCurrency } = useCurrency();

  const { data: stats }              = useDashboardStats(initialStats);
  const { data: transactions }        = useRecentTransactions(initialTransactions);
  const { data: installments }        = useInstallments(initialInstallments);
  const { data: blocks }              = useBlocks(initialBlocks);
  const { data: recurring }           = useRecurring(initialRecurring);
  const { data: goals }               = useGoals(initialGoals);

  const balance      = stats?.balance ?? { total: 0, currency: "USD", change: 0 } as BalanceData;
  const monthly      = stats?.monthly ?? { income: 0, spending: 0, savings: 0, savingsGoal: 5000 } as MonthlyStats;
  const categories   = stats?.categories ?? [] as Category[];
  const spendingTrend = stats?.spendingTrend ?? [];
  const monthDaily    = stats?.monthDaily ?? [];
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Buen día" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1);

  const currentMonthName = new Date().toLocaleDateString("es-AR", { month: "long" });
  const currentMonthCap  = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  const monthBudget  = monthly.savingsGoal > 0 ? monthly.savingsGoal : monthly.spending || 1;

  const recurringByDue = (recurring ?? [])
    .filter(r => !r.paused)
    .sort((a, b) => a.nextDueDateMs - b.nextDueDateMs)
    .slice(0, 5);

  const [period, setPeriod] = useState<"semana" | "mes">("mes");
  const [showUsd, setShowUsd] = useState(false);

  const weekStats   = stats?.weekStats  ?? { spending: 0, daily: [] };
  const goalList = goals ?? [];
  const totalSaved = goalList.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goalList.reduce((s, g) => s + g.targetAmount, 0);
  const totalPct = totalTarget > 0 ? Math.min(1, totalSaved / totalTarget) : 0;

  const weekBudget = Math.round(monthBudget / 4.3);
  const weekSpend = weekStats?.spending ?? 0;
  const weekAvailable = weekBudget - weekSpend;

  const displaySpend = period === 'semana' ? weekSpend : monthly.spending;
  const displayBudget = period === 'semana' ? weekBudget : monthBudget;
  const displayAvailable = period === 'semana' ? weekAvailable : (monthBudget - monthly.spending);
  const displayIncome = monthly.income;

  const displayPctRaw = displaySpend / (displayBudget || 1);
  const displayPct = Math.min(1, displayPctRaw);
  const displayIsOverBudget = displayPctRaw > 1;
  const displayOverBy = displayIsOverBudget ? displaySpend - displayBudget : 0;

  const prevMonth = stats?.previousMonth;
  const deltaSpending = prevMonth && prevMonth.spending > 0
    ? Math.round(((monthly.spending - prevMonth.spending) / prevMonth.spending) * 100)
    : null;
  const deltaIncome = prevMonth && prevMonth.income > 0
    ? Math.round(((monthly.income - prevMonth.income) / prevMonth.income) * 100)
    : null;

  const txList = transactions ?? [];
  const instList = installments ?? [];
  const blockList = blocks ?? [];

  const getMonday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const filterByPeriod = (txs: typeof txList, p: "semana" | "mes") => {
    const now = new Date();
    if (p === "semana") {
      const monday = getMonday();
      return txs.filter(tx => new Date((tx as any).isoDate) >= monday);
    }
    return txs.filter(tx => {
      const d = new Date((tx as any).isoDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  };

  const filteredTx = filterByPeriod(txList, period);

  const candleData =
    period === "semana"
      ? (stats?.weekStats?.daily ?? []).map((d) => ({ label: d.day.slice(0, 3), amount: d.amount }))
      : monthDaily
          .filter((d) => d.day <= new Date().getDate())
          .map((d) => ({ label: String(d.day), amount: d.amount }));

  const candleUnit = period === "semana" ? "días" : "días del mes";

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
          <Tooltip label="Anotar gasto (⌘N)">
            <motion.button
              onClick={() => openCapture("expense")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "var(--ink)", color: "var(--inverse)", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12">
                <line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </motion.button>
          </Tooltip>
        </motion.div>
      </header>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "0 40px 100px" }}>

        {/* ── Hero balance + Ahorro ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.4 }}
          style={{ paddingTop: 52, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Eyebrow>Balance total</Eyebrow>
              {((stats?.balanceUsd ?? usdBalance ?? 0) > 0) && (
                <button
                  onClick={() => setShowUsd(s => !s)}
                  className="mono"
                  style={{
                    fontSize: 9, letterSpacing: "0.1em",
                    padding: "2px 7px", borderRadius: 5,
                    background: showUsd ? "var(--ink)" : "var(--surface)",
                    color: showUsd ? "var(--inverse)" : "var(--mute)",
                    border: `1px solid ${showUsd ? "transparent" : "var(--hairline)"}`,
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 140ms ease",
                  }}
                >
                  {showUsd ? "USD" : "ARS"}
                </button>
              )}
            </div>
            <div style={{ marginTop: 20 }}>
              {showUsd && (stats?.balanceUsd ?? usdBalance ?? 0) > 0 ? (
                <span className="display tnum" style={{
                  fontSize: 96, fontWeight: 500, letterSpacing: "-0.05em", lineHeight: 0.92, color: "var(--ink)",
                }}>
                  <span className="mono" style={{ fontSize: 32, letterSpacing: "0.02em", verticalAlign: "baseline", marginRight: 4, opacity: 0.45 }}>us$</span>
                  <AnimatedNumber value={stats?.balanceUsd ?? usdBalance ?? 0} decimals={2} />
                </span>
              ) : (
                <span className="display tnum" style={{
                  fontSize: 96, fontWeight: 500, letterSpacing: "-0.05em", lineHeight: 0.92, color: "var(--ink)",
                }}>
                  <AnimatedNumber value={balance.total} decimals={2} />
                </span>
              )}
            </div>
            {dolarRate && dolarRate.blue.venta > 0 && (
              <div className="mono" style={{ fontSize: 12, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 12, display: "flex", gap: 16 }}>
                {showUsd && (stats?.balanceUsd ?? usdBalance ?? 0) > 0 ? (
                  <>
                    <span>
                      ≈ $ {Math.round((stats?.balanceUsd ?? usdBalance ?? 0) * dolarRate.blue.venta).toLocaleString("es-AR")}
                      <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.45 }}>ARS (Blue)</span>
                    </span>
                    {dolarRate.oficial.venta > 0 && (
                      <span>
                        ≈ $ {Math.round((stats?.balanceUsd ?? usdBalance ?? 0) * dolarRate.oficial.venta).toLocaleString("es-AR")}
                        <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.45 }}>ARS (Oficial)</span>
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span>
                      ≈ USD {Math.round(balance.total / dolarRate.blue.venta).toLocaleString("es-AR")}
                      <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.45 }}>Blue</span>
                    </span>
                    {dolarRate.oficial.venta > 0 && (
                      <span>
                        ≈ USD {Math.round(balance.total / dolarRate.oficial.venta).toLocaleString("es-AR")}
                        <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.45 }}>Oficial</span>
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          {goalList.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="var(--hairline)" strokeWidth="3" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="var(--ink)" strokeWidth="3"
                  strokeDasharray={`${totalPct * 100} 100`} strokeLinecap="round"
                  transform="rotate(-90 20 20)" />
                <text x="20" y="23" textAnchor="middle" className="mono" fontSize="8" fill="var(--ink)">
                  {Math.round(totalPct * 100)}%
                </text>
              </svg>
              <div>
                <div className="tnum display" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
                  {formatCurrency(totalSaved, true)}
                </div>
                <div className="mono" style={{ fontSize: 9, color: 'var(--faint)', letterSpacing: '0.06em' }}>
                  {goalList.length === 1 ? goalList[0].name : `${goalList.length} metas`}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Period section ── */}
        <ScrollReveal direction="up" distance={24}>
          <div style={{ paddingTop: 48 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                {period === "semana" ? "Últimos 7 días" : `Este mes · ${currentMonthCap}`}
              </div>
              <div style={{ display: 'flex', gap: 18 }}>
                {(['semana', 'mes'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className="mono"
                    style={{
                      padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: period === p ? 'var(--ink)' : 'var(--faint)',
                      borderBottom: period === p ? '1px solid var(--ink)' : '1px solid transparent',
                      transition: 'all 200ms ease',
                    }}
                  >
                    {p === 'semana' ? 'Semana' : 'Mes'}
                  </button>
                ))}
              </div>
            </div>

            {/* Gastado — prominent with progress bar */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Gastado
                </div>
                {displayIsOverBudget && (
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink)", letterSpacing: "0.06em", fontWeight: 500 }}>
                    +<AnimatedNumber value={displayOverBy} prefix="$" /> sobre el presupuesto
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
                <div className="display tnum" style={{ fontSize: 48, fontWeight: 500, letterSpacing: "-0.05em", color: "var(--ink)", lineHeight: 1, display: "flex", alignItems: "baseline", gap: 8 }}>
                  <AnimatedNumber value={displaySpend} prefix="$" />
                  <span style={{ color: "var(--faint)", fontSize: 20, fontWeight: 400, display: "flex", alignItems: "baseline", gap: 4 }}>
                    / <AnimatedNumber value={displayBudget} prefix="$" />
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
                    {Math.round(displayPctRaw * 100)}%
                  </div>
                  <div className="mono" style={{ fontSize: 8, color: "var(--faint)", letterSpacing: "0.1em", marginTop: 4 }}>
                    PRESUPUESTO →
                  </div>
                </Link>
              </div>
              <div style={{ height: 6, background: "var(--hairline2)", borderRadius: 99, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${displayPct * 100}%` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: "100%", background: "var(--ink)", borderRadius: 99 }}
                />
              </div>
            </div>

            {/* 4 stat cards */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } } }}
              style={{ display: "grid", gridTemplateColumns: `repeat(${period === "semana" ? 2 : 3}, 1fr)`, gap: 24 }}
            >
              {(period === "semana"
                ? [
                    { value: displaySpend, label: "Gastado", suffix: "", delta: null as number | null },
                    { value: displayIncome, label: "Ingreso", suffix: "", delta: null as number | null },
                  ]
                : [
                    { value: displaySpend, label: "Gastado", suffix: "", delta: deltaSpending },
                    { value: displayAvailable, label: "Disponible", suffix: "", delta: null as number | null },
                    { value: displayIncome, label: "Ingreso", suffix: "", delta: deltaIncome },
                  ]
              ).map(s => (
                <motion.div key={s.label} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: springGentle } }}>
                  <Stat value={s.value} label={s.label} size={28} suffix={s.suffix} />
                  {s.delta !== null && s.delta !== 0 && (
                    <div className="mono" style={{
                      fontSize: 9, color: "var(--mute)", letterSpacing: "0.06em",
                      marginTop: 6, display: "flex", alignItems: "center", gap: 3,
                    }}>
                      <span style={{ color: s.delta > 0 ? "var(--ink)" : "var(--mute)", opacity: 0.6 }}>
                        {s.delta > 0 ? "↑" : "↓"}
                      </span>
                      {s.delta > 0 ? "+" : ""}{s.delta}% vs mes anterior
                    </div>
                  )}
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

            {/* ── Candlestick chart ── */}
            <div style={{ marginTop: 40 }}>
              <CandlestickChart data={candleData} unit={candleUnit} />
            </div>

          </div>
        </ScrollReveal>

        {/* ── Two columns: Cuotas + Recurrentes ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 48 }}>

          {/* LEFT: Cuotas activas */}
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

          {/* RIGHT: Recurrentes próximos */}
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
                  {(recurring ?? []).filter(r => !r.paused).length} activos →
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

        {/* ── Bloques de vida: 3-column grid ── */}
        <div style={{ marginTop: 48 }}>
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
                  Ver todos · {blockList.length} →
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
              style={{
                borderTop: "1px solid var(--hairline)",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
              }}
            >
              {blockList.slice(0, 6).map((block, i) => {
                const pct = block.budget > 0 ? Math.min(1, block.spent / block.budget) : 0;
                const glyphKind: GlyphKind = (block.icon as GlyphKind) || BLOCK_GLYPHS[i % BLOCK_GLYPHS.length];
                const col = i % 3;
                const row = Math.floor(i / 3);
                const totalRows = Math.ceil(Math.min(blockList.length, 6) / 3);
                const fmtCompact = (n: number) =>
                  n >= 10000 ? `${Math.round(n / 1000)}k`
                  : n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}k`
                  : String(Math.round(n));
                return (
                  <motion.div
                    key={block.id}
                    variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: springGentle } }}
                    style={{
                      borderLeft: col > 0 ? "1px solid var(--hairline)" : "none",
                      borderBottom: row < totalRows - 1 ? "1px solid var(--hairline)" : "none",
                    }}
                  >
                    <Link
                      href={`/blocks/${block.id}`}
                      style={{
                        display: "flex", flexDirection: "column",
                        padding: 20, textDecoration: "none",
                        height: "100%", boxSizing: "border-box",
                      }}
                    >
                      {/* Top row: icon + ring */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <BlockGlyph kind={glyphKind} size={24} />
                        {/* Radial ring 36px */}
                        <svg width="36" height="36" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
                          <circle cx="18" cy="18" r="15" fill="none" stroke="var(--hairline2)" strokeWidth="2"/>
                          <circle
                            cx="18" cy="18" r="15" fill="none"
                            stroke="var(--ink)" strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 15}`}
                            strokeDashoffset={`${2 * Math.PI * 15 * (1 - pct)}`}
                            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.2,.7,.1,1)" }}
                          />
                        </svg>
                      </div>
                      {/* Name */}
                      <div className="display" style={{
                        fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
                        color: "var(--ink)", lineHeight: 1.1,
                      }}>
                        {block.name}
                      </div>
                      {/* Description / goal */}
                      {block.goal && (
                        <div className="mono" style={{
                          fontSize: 11, color: "var(--mute)", letterSpacing: "0.02em",
                          marginTop: 4,
                        }}>
                          {block.goal}
                        </div>
                      )}
                      {/* Bottom: amount + tx count */}
                      <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "baseline",
                        marginTop: 12,
                      }}>
                        <span className="display tnum" style={{
                          fontSize: 13, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--ink)",
                        }}>
                          {fmtCompact(block.spent)}{block.budget > 0 ? `/${fmtCompact(block.budget)}` : ""}
                        </span>
                        <span className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.04em" }}>
                          {block.expenses} mov
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* ── Movimientos del período ── */}
        <div style={{ marginTop: 48 }}>
          <div style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between",
            marginBottom: 16,
          }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              {period === "semana" ? `Últimos 7 días · ${filteredTx.length} ${filteredTx.length === 1 ? "movimiento" : "movimientos"}`
               : `Este mes · ${filteredTx.length} ${filteredTx.length === 1 ? "movimiento" : "movimientos"}`}
            </div>
            <Link href="/transactions" style={{ cursor: "pointer", color: "var(--ink)", textDecoration: "none" }}>
              <span className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.08em" }}>Ver todo →</span>
            </Link>
          </div>
          {filteredTx.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springGentle, delay: 0.3 }}
              style={{ padding: "32px 0", borderTop: "1px solid var(--hairline)" }}
            >
              <div className="body-font" style={{ fontSize: 14, color: "var(--mute)", letterSpacing: "-0.005em", marginBottom: 8 }}>
                Sin movimientos
              </div>
              <div className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.04em", marginBottom: 16 }}>
                No hay movimientos en este período.
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
              {filteredTx.slice(0, 5).map((tx, i, arr) => {
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
