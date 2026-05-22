"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Glyph, CATEGORY_GLYPH } from "@/components/ui/glyph";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import type { MonthlyStats, Category, Transaction, WeekStats } from "@gastar/shared";

import { AnimatedNumber } from "@/components/motion/animated-number";
import { springGentle } from "@/components/motion/presets";
import { useCurrency } from "@/hooks/use-currency";
import { Hairline, TxRow, type GlyphKind } from "@/components/ui/primitives";

// ── Eyebrow ──
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

// ── Helpers ──
function fmtAmount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

function computeCategoriesFromTxs(txs: Transaction[]): Category[] {
  const catMap = new Map<string, number>();
  let total = 0;
  for (const tx of txs) {
    if (tx.amount < 0) {
      const abs = Math.abs(tx.amount);
      catMap.set(tx.category, (catMap.get(tx.category) ?? 0) + abs);
      total += abs;
    }
  }
  return Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({
      name,
      amount: Math.round(amount),
      percent: total > 0 ? Math.round((amount / total) * 100) : 0,
    }));
}

// ── Types ──
interface Props {
  monthly: MonthlyStats;
  categories: Category[];
  transactions: Transaction[];
  weekStats: WeekStats;
  patrimonioNeto: number;
  dailySeries: { day: number; amount: number }[];
}

const MONTH_ABBR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// ── SpendingDonut ──
function SpendingDonut({ categories }: { categories: Category[] }) {
  const top5 = categories.slice(0, 5);
  const totalTop = top5.reduce((s, c) => s + c.amount, 0);
  const otherAmount = categories.slice(5).reduce((s, c) => s + c.amount, 0);

  const slices = [
    ...top5.map(c => ({ name: c.name, amount: c.amount, percent: c.percent })),
    ...(otherAmount > 0 ? [{ name: "Otros", amount: otherAmount, percent: Math.round((otherAmount / (totalTop + otherAmount)) * 100) }] : []),
  ];
  const total = slices.reduce((s, sl) => s + sl.amount, 0);

  if (total === 0) {
    return <div className="mono" style={{ fontSize: 11, color: "var(--faint)", padding: "12px 0" }}>Sin gastos este mes.</div>;
  }

  const r = 44;
  const strokeW = 18;
  const c = 2 * Math.PI * r;
  const opacities = [1, 0.62, 0.36, 0.18, 0.09, 0.04];
  const gap = 2; // px gap between slices

  let offset = 0;
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center", marginTop: 18 }}>
      <svg width={108} height={108} viewBox="0 0 108 108" style={{ flexShrink: 0 }}>
        {slices.map((slice, i) => {
          const sliceLen = Math.max(0, (slice.amount / total) * c - gap);
          const dashOffset = -offset;
          offset += sliceLen + gap;
          return (
            <circle
              key={slice.name + '-' + i}
              cx={54} cy={54} r={r}
              fill="none"
              stroke="var(--ink)"
              strokeWidth={strokeW}
              strokeDasharray={`${sliceLen} ${c}`}
              strokeDashoffset={dashOffset}
              opacity={opacities[i] ?? 0.04}
              transform="rotate(-90 54 54)"
            />
          );
        })}
        {/* Center dot */}
        <circle cx={54} cy={54} r={8} fill="var(--bg)" />
      </svg>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {slices.map((slice, i) => (
          <div key={slice.name + '-' + i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "var(--ink)", opacity: opacities[i], flexShrink: 0,
            }} />
            <span style={{
              flex: 1, fontSize: 11, color: "var(--ink)", letterSpacing: "-0.005em",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {slice.name}
            </span>
            <span className="mono tnum" style={{ fontSize: 9, color: "var(--mute)" }}>{slice.percent}%</span>
            <span className="tnum display" style={{ fontSize: 11, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.01em" }}>
              {fmtAmount(slice.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DailySpendingChart (velas del mes + promedio) ──
function DailySpendingChart({ dailySeries }: { dailySeries: { day: number; amount: number }[] }) {
  const today = new Date().getDate();
  const visibleDays = dailySeries.filter(d => d.day <= today);
  const max = Math.max(...visibleDays.map(d => d.amount), 1);
  const totalSpending = visibleDays.reduce((s, d) => s + d.amount, 0);
  const avg = Math.round(totalSpending / today);

  if (visibleDays.every(d => d.amount === 0)) {
    return (
      <div className="mono" style={{ fontSize: 11, color: "var(--faint)", padding: "44px 0", textAlign: "center" }}>
        Sin gastos este mes
      </div>
    );
  }

  return (
    <div style={{ marginTop: 18, position: "relative" }}>
      {/* Average label */}
      <div className="mono" style={{
        position: "absolute", right: 0, top: -2,
        fontSize: 9, color: "var(--mute)", letterSpacing: "0.04em",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        <span style={{ display: "inline-block", width: 14, height: 1, background: "var(--mute)" }} />
        Prom. ${avg.toLocaleString("es-AR")}
      </div>

      {/* Chart area */}
      <div style={{
        display: "flex", alignItems: "flex-end", gap: 2,
        height: 88, position: "relative", marginTop: 14,
      }}>
        {/* Average line */}
        {avg > 0 && (
          <div style={{
            position: "absolute", left: 0, right: 0, zIndex: 1,
            bottom: `${(avg / max) * 88}%`,
            height: 1, background: "var(--mute)",
          }} />
        )}

        {visibleDays.map((d, i) => {
          const h = Math.max(3, (d.amount / max) * 84);
          return (
            <div key={d.day} style={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: h }}
                transition={{ duration: 0.4, delay: i * 0.01, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: "100%", borderRadius: 2, marginTop: "auto",
                  background: d.day === today ? "var(--ink)" : "var(--hairline2)",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Day labels */}
      <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
        {visibleDays.map((d, i) => {
          const showLabel = i === 0 || i === visibleDays.length - 1 || d.day === today || d.day % 5 === 0;
          return (
            <div key={d.day} style={{
              flex: 1, textAlign: "center", fontSize: 8, color: "var(--faint)",
              letterSpacing: "0.04em", fontFamily: "var(--mono)",
              visibility: showLabel ? "visible" : "hidden",
            }}>
              {d.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── WeekBarChart (bars for each day of the week) ──
function WeekBarChart({ weekStats }: { weekStats: WeekStats }) {
  const data = weekStats.daily.map(d => ({ label: d.day, amount: d.amount }));
  if (data.length === 0 || data.every(d => d.amount === 0)) {
    return (
      <div className="mono" style={{ fontSize: 11, color: "var(--faint)", padding: "20px 0", textAlign: "center" }}>
        Sin datos aún
      </div>
    );
  }

  const max = Math.max(...data.map(x => x.amount), 1);
  return (
    <div style={{ marginTop: 18, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 88 }}>
        {data.map((p, i) => {
          const h = Math.max(6, (p.amount / max) * 72);
          const isLast = i === data.length - 1;
          return (
            <div key={p.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span className="mono tnum" style={{
                fontSize: 9, color: isLast ? "var(--ink)" : "var(--faint)",
                letterSpacing: "0.04em", fontWeight: isLast ? 500 : 400,
              }}>
                ${fmtAmount(p.amount)}
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
                {p.label.slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SpendingHeatmap (GitHub-style) ──
function SpendingHeatmap({ transactions }: { transactions: Transaction[] }) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const totalWeeks = 21;
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (totalWeeks * 7) - mondayOffset);
  startDate.setHours(0, 0, 0, 0);

  const spendMap = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.amount >= 0) continue;
    const isoDate = (tx as any).isoDate as string | undefined;
    if (!isoDate) continue;
    spendMap.set(isoDate, (spendMap.get(isoDate) ?? 0) + Math.abs(tx.amount));
  }

  const amounts = Array.from(spendMap.values()).sort((a, b) => a - b);
  const q1 = amounts[Math.floor(amounts.length * 0.25)] ?? 0;
  const q2 = amounts[Math.floor(amounts.length * 0.50)] ?? 0;
  const q3 = amounts[Math.floor(amounts.length * 0.75)] ?? 0;

  function level(v: number): number {
    if (v === 0) return 0;
    if (v <= q1) return 1;
    if (v <= q2) return 2;
    if (v <= q3) return 3;
    return 4;
  }

  const levels = [
    { bg: "var(--hairline2)", opacity: 1 },
    { bg: "var(--ink)", opacity: 0.1 },
    { bg: "var(--ink)", opacity: 0.22 },
    { bg: "var(--ink)", opacity: 0.42 },
    { bg: "var(--ink)", opacity: 0.78 },
  ];

  const grid: { date: Date; amount: number; lvl: number }[][] = [];
  const d = new Date(startDate);
  for (let col = 0; col < totalWeeks; col++) {
    const week: { date: Date; amount: number; lvl: number }[] = [];
    for (let row = 0; row < 7; row++) {
      const iso = d.toISOString().slice(0, 10);
      const amt = spendMap.get(iso) ?? 0;
      week.push({ date: new Date(d), amount: amt, lvl: amt === 0 ? 0 : level(amt) });
      d.setDate(d.getDate() + 1);
    }
    grid.push(week);
  }

  const monthLabels: { col: number; label: string }[] = [];
  for (let col = 0; col < grid.length; col++) {
    const m = grid[col][0].date.getMonth();
    const prev = col > 0 ? grid[col - 1][0].date.getMonth() : -1;
    if (prev !== m) monthLabels.push({ col, label: MONTH_ABBR[m] });
  }

  const DAY_LABELS = ["L", "", "X", "", "V", "", "D"];

  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
        {/* Day labels */}
        <div style={{ display: "grid", gridTemplateRows: "repeat(7, 1fr)", gap: 3, paddingTop: 16 }}>
          {DAY_LABELS.map((l, i) => (
            <div key={i} className="mono" style={{
              fontSize: 8, color: "var(--faint)", letterSpacing: "0.06em",
              textAlign: "right", paddingRight: 4, lineHeight: "12px",
              visibility: l ? "visible" as const : "hidden" as const,
            }}>{l}</div>
          ))}
        </div>

        <div style={{ flex: 1, overflow: "hidden" }}>
          {/* Month labels */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${totalWeeks}, 1fr)`, gap: 3, marginBottom: 2 }}>
            {Array.from({ length: totalWeeks }).map((_, col) => {
              const ml = monthLabels.find(m => m.col === col);
              return (
                <div key={col} className="mono" style={{
                  fontSize: 8, color: ml ? "var(--faint)" : "transparent",
                  letterSpacing: "0.06em",
                }}>{ml?.label ?? ""}</div>
              );
            })}
          </div>

          {/* Cells */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${totalWeeks}, 1fr)`, gap: 3 }}>
            {Array.from({ length: 7 }).map((_, row) =>
              Array.from({ length: totalWeeks }).map((__, col) => {
                const cell = grid[col][row];
                const l = levels[cell.lvl];
                const isFuture = cell.date > today;
                return (
                  <div
                    key={`${row}-${col}`}
                    onMouseEnter={(e) => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setTooltip({
                        text: `${cell.date.toLocaleDateString("es-AR", { day: "numeric", month: "short" })} · $${cell.amount.toLocaleString("es-AR")}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      aspectRatio: "1",
                      borderRadius: 2,
                      background: isFuture ? "transparent" : l.bg,
                      opacity: isFuture ? 0 : l.opacity,
                      cursor: cell.amount > 0 ? "pointer" : "default",
                    }}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="mono"
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            background: "var(--bg)",
            borderRadius: 5,
            padding: "4px 8px",
            border: "1px solid var(--hairline)",
            fontSize: 10,
            color: "var(--ink)",
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 999,
            boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 10, justifyContent: "flex-end" }}>
        <span className="mono" style={{ fontSize: 8, color: "var(--faint)", letterSpacing: "0.06em", marginRight: 4 }}>Menos</span>
        {levels.map((l, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: l.bg, opacity: l.opacity }} />
        ))}
        <span className="mono" style={{ fontSize: 8, color: "var(--faint)", letterSpacing: "0.06em", marginLeft: 4 }}>Más</span>
      </div>
    </div>
  );
}

// ── MetricsGrid ──
function MetricsGrid({ income, spending, savings, savingsRate, hideSavings }: {
  income: number; spending: number; savings: number; savingsRate: number; hideSavings?: boolean;
}) {
  const stats = hideSavings
    ? [
        { label: "Ingresos", value: income, prefix: "$" },
        { label: "Gastos", value: spending, prefix: "$" },
        { label: "Tasa de ahorro", value: savingsRate, suffix: "%" },
      ]
    : [
        { label: "Ingresos", value: income, prefix: "$" },
        { label: "Gastos", value: spending, prefix: "$" },
        { label: "Ahorrado", value: savings, prefix: "$" },
        { label: "Tasa de ahorro", value: savingsRate, suffix: "%" },
      ];
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
      }}
      style={{ paddingTop: 36, display: "grid", gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 32 }}
    >
      {stats.map(stat => (
        <motion.div
          key={stat.label}
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: springGentle } }}
        >
          <div className="display tnum" style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.04em", color: "var(--ink)", lineHeight: 1 }}>
            {stat.prefix && <span style={{ color: "var(--faint)", fontSize: 16 }}>{stat.prefix}</span>}
            <AnimatedNumber value={stat.value} suffix={stat.suffix} />
          </div>
          <div className="mono" style={{ fontSize: 9, color: "var(--mute)", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 8 }}>
            {stat.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ── Main ──
export function InsightsClient({ monthly, categories, transactions, weekStats, patrimonioNeto, dailySeries }: Props) {
  const { format: formatCurrency } = useCurrency();
  const [period, setPeriod] = useState<"semana" | "mes" | "6meses" | "1año">("mes");
  const monthlySavingsRate = monthly.income > 0 ? Math.round((monthly.savings / monthly.income) * 100) : 0;
  const dailyTotal = dailySeries.reduce((s, d) => s + d.amount, 0);

  // Top merchants (by frequency)
  const merchantFreq = transactions.reduce<Record<string, number>>((acc, t) => {
    if (t.amount < 0) acc[t.name] = (acc[t.name] || 0) + 1;
    return acc;
  }, {});
  const topMerchants = Object.entries(merchantFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // ─── Period filter ──────────────────────────────────
  const filterByPeriod = (txs: Transaction[], p: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (p === "semana") {
      const day = now.getDay();
      const monday = new Date(today);
      monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
      return txs.filter(tx => new Date((tx as any).isoDate) >= monday);
    }
    if (p === "6meses") {
      const cutoff = new Date(today);
      cutoff.setMonth(cutoff.getMonth() - 6);
      return txs.filter(tx => new Date((tx as any).isoDate) >= cutoff);
    }
    if (p === "1año") {
      const cutoff = new Date(today);
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      return txs.filter(tx => new Date((tx as any).isoDate) >= cutoff);
    }
    return txs;
  };

  const filteredTx = filterByPeriod(transactions, period);
  const isMonth = period === "mes";
  const isMonthOrMore = period !== "semana";

  // For week view, compute stats and categories from filtered transactions
  const weekIncome = filteredTx.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const weekSpending = filteredTx.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const displayIncome = isMonthOrMore ? monthly.income : Math.round(weekIncome);
  const displaySpending = isMonthOrMore ? monthly.spending : Math.round(weekSpending);
  const displaySavings = isMonthOrMore ? monthly.savings : Math.round(weekIncome - weekSpending);
  const displaySavingsRate = displayIncome > 0 ? Math.round((displaySavings / displayIncome) * 100) : 0;

  const displayCategories = isMonthOrMore ? categories : computeCategoriesFromTxs(filteredTx);

  return (
    <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px 80px" }}>
      {/* Header */}
      <header style={{ paddingBottom: 28, borderBottom: "1px solid var(--hairline)" }}>
        <motion.div
          className="mono"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.05 }}
          style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}
        >
          Análisis
        </motion.div>
        <motion.h1
          className="display"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.1 }}
          style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em", color: "var(--ink)", lineHeight: 1 }}
        >
          Lectura
        </motion.h1>
      </header>

      {/* Period selector */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.15 }}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 24, marginBottom: 32,
        }}
      >
        <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          {period === "semana" ? "Esta semana" : period === "6meses" ? "Últimos 6 meses" : period === "1año" ? "Último año" : "Resumen mensual"}
        </div>
        <div style={{ display: 'flex', gap: 18 }}>
          {(["semana", "mes", "6meses", "1año"] as const).map(p => (
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
              {p === 'semana' ? 'Semana' : p === 'mes' ? 'Mes' : p === '6meses' ? '6 meses' : '1 año'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Patrimonio Neto — always visible */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.2 }}
        style={{ padding: "32px 0", borderBottom: "1px solid var(--hairline)" }}
      >
        <div className="mono" style={{
          fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em",
          textTransform: "uppercase", marginBottom: 12,
        }}>
          Patrimonio neto
        </div>
        <div className="display tnum" style={{
          fontSize: 44, fontWeight: 500, letterSpacing: "-0.05em",
          color: "var(--ink)", lineHeight: 1,
        }}>
          <span style={{ color: "var(--faint)", fontSize: 24 }}>$</span>
          <AnimatedNumber value={patrimonioNeto} />
        </div>
      </motion.div>

      {/* Key stats — always visible, data varies by period */}
      <MetricsGrid
        income={displayIncome}
        spending={displaySpending}
        savings={displaySavings}
        savingsRate={displaySavingsRate}
        hideSavings={period === "semana"}
      />

      {/* Daily spending chart — only for current month */}
      {isMonth && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginTop: 48 }}
        >
          <Eyebrow right={<AnimatedNumber value={dailyTotal} prefix="$" />}>
            Gasto diario
          </Eyebrow>
          <DailySpendingChart dailySeries={dailySeries} />
        </motion.div>
      )}

      {/* Week bar chart — only for week */}
      {period === "semana" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginTop: 48 }}
        >
          <Eyebrow right={`Total ${formatCurrency(weekStats.spending, true)}`}>
            Gasto diario · Esta semana
          </Eyebrow>
          <WeekBarChart weekStats={weekStats} />
        </motion.div>
      )}

      {/* Two-column chart grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginTop: 48 }}
      >
        {/* LEFT: Donut + CategoryBreakdown */}
        <div>
          <Eyebrow right={displayCategories.length > 0 ? <AnimatedNumber value={displayCategories.reduce((s, c) => s + c.amount, 0)} prefix="$" /> : undefined}>
            Por categoría
          </Eyebrow>
          <SpendingDonut categories={displayCategories} />
          <div style={{ marginTop: 24 }}>
            <CategoryBreakdown categories={displayCategories} />
          </div>
        </div>

        {/* RIGHT: Heatmap + Merchants — only for month or longer */}
        {isMonthOrMore && (
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            {/* Heatmap */}
            <div>
              <Eyebrow>Intensidad de gasto</Eyebrow>
              <SpendingHeatmap transactions={transactions} />
            </div>

            {/* Merchants */}
            <div>
              <Eyebrow>Frecuencia de compra</Eyebrow>
              {topMerchants.length === 0 ? (
                <div className="mono" style={{ fontSize: 11, color: "var(--faint)", marginTop: 20 }}>Sin datos</div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
                  }}
                  style={{ marginTop: 14 }}
                >
                  {topMerchants.map(([name, count], i) => (
                    <motion.div
                      key={name}
                      variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0, transition: springGentle } }}
                    >
                      {i > 0 && <div style={{ height: 1, background: "var(--hairline)" }} />}
                      <div style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{
                          flex: 1, fontSize: 13, color: "var(--ink)", letterSpacing: "-0.005em",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {name}
                        </span>
                        <div className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.04em" }}>
                          ×{count}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Transaction list — for week view */}
      {period === "semana" && (
        <div style={{ marginTop: 56 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>
            Movimientos · Esta semana · {filteredTx.length} {filteredTx.length === 1 ? "movimiento" : "movimientos"}
          </div>
          {filteredTx.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springGentle, delay: 0.3 }}
              style={{ padding: "24px 0", borderTop: "1px solid var(--hairline)" }}
            >
              <div className="body-font" style={{ fontSize: 14, color: "var(--mute)", letterSpacing: "-0.005em", marginBottom: 8 }}>
                Sin movimientos
              </div>
              <div className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.04em" }}>
                No hay movimientos en este período.
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
              style={{ borderTop: "1px solid var(--hairline)" }}
            >
              {filteredTx.slice(0, 8).map((tx, i, arr) => {
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
      )}
    </div>
    </div>
  );
}
