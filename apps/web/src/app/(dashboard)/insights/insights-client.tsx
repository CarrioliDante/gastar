"use client";

import { motion } from "motion/react";
import { Glyph, CATEGORY_GLYPH } from "@/components/ui/glyph";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import type { MonthlyStats, SpendingPoint, Category, Transaction } from "@gastar/shared";
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { springGentle } from "@/components/motion/presets";

// ── ChartTooltip (recharts) ──
function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number; name?: string }>; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0A0A0A", borderRadius: 12, padding: "9px 16px" }}>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.08em", marginBottom: 3 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: "#F5F5F2", fontSize: 16, fontWeight: 300, letterSpacing: "-0.5px" }}>
          {p.name ? `${p.name}: ` : ""}${p.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </p>
      ))}
    </div>
  );
}

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

// ── Types ──
interface PulsoData {
  score: number;
  mood: string;
  components: { label: string; value: number; weight: number }[];
}

interface Props {
  monthly: MonthlyStats;
  spendingTrend: SpendingPoint[];
  incomeTrend: SpendingPoint[];
  categories: Category[];
  transactions: Transaction[];
  pulso: PulsoData;
}

// ── PulsoWidget ──
function PulsoWidget({ pulso }: { pulso: PulsoData }) {
  const r = 40, c = 2 * Math.PI * r;
  return (
    <div style={{ padding: "28px 0 24px", borderBottom: "1px solid var(--hairline)" }}>
      <Eyebrow>Pulso Financiero</Eyebrow>
      <div style={{ marginTop: 20, display: "flex", gap: 32, alignItems: "center" }}>
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

// ── Main ──
export function InsightsClient({ monthly, spendingTrend, incomeTrend, categories, transactions, pulso }: Props) {
  const totalSpending = categories.reduce((s, c) => s + c.amount, 0);
  const savingsRate = monthly.income > 0 ? Math.round((monthly.savings / monthly.income) * 100) : 0;

  // Merge income + spending trend for bar chart
  const barData = spendingTrend.map((s, i) => ({
    month: s.month,
    Ingresos: incomeTrend[i]?.amount ?? 0,
    Gastos: s.amount,
  }));

  // Radar data from pulso components
  const radarData = pulso.components.map(c => ({
    dimension: c.label,
    value: Math.round(c.value * 100),
  }));

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

      {/* Pulso */}
      <PulsoWidget pulso={pulso} />

      {/* Key stats */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
        }}
        style={{ paddingTop: 36, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}
      >
        {[
          { label: "Ingresos", value: monthly.income, prefix: "$" },
          { label: "Gastos", value: monthly.spending, prefix: "$" },
          { label: "Ahorrado", value: monthly.savings, prefix: "$" },
          { label: "Tasa de ahorro", value: savingsRate, suffix: "%" },
        ].map(stat => (
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

      {/* Two-column chart grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginTop: 52 }}>

        {/* LEFT: Donut + Radar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {/* Donut */}
          <ScrollReveal direction="up" distance={24}>
            <div>
              <Eyebrow right={totalSpending > 0 ? `$${totalSpending.toLocaleString("en-US")}` : undefined}>
                Por categoría
              </Eyebrow>
              <div style={{ marginTop: 18 }}>
                <CategoryBreakdown categories={categories} />
              </div>
            </div>
          </ScrollReveal>

          {/* Radar */}
          <ScrollReveal direction="up" distance={24}>
            <div>
              <Eyebrow>Salud financiera</Eyebrow>
              <div style={{ marginTop: 18, background: "#FAFAF8", borderRadius: 28, padding: 24, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(0,0,0,0.06)" />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fontSize: 10, fill: "rgba(0,0,0,0.35)", fontFamily: "Inter, sans-serif" }}
                    />
                    <Radar
                      dataKey="value"
                      stroke="#111111"
                      fill="#111111"
                      fillOpacity={0.06}
                      strokeWidth={1.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* RIGHT: Area + Bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {/* Area — spending trend */}
          <ScrollReveal direction="up" distance={24}>
            <div>
              <Eyebrow right="6 meses">Tendencia de gastos</Eyebrow>
              <div style={{ marginTop: 18, background: "#FAFAF8", borderRadius: 28, padding: "24px 20px 12px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
                {spendingTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={spendingTrend} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="insightsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#111111" stopOpacity={0.1} />
                          <stop offset="100%" stopColor="#111111" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "rgba(0,0,0,0.25)", fontSize: 10, fontFamily: "Inter, sans-serif", letterSpacing: "0.04em" }}
                        dy={8}
                      />
                      <Tooltip
                        content={<ChartTooltip />}
                        cursor={{ stroke: "rgba(0,0,0,0.08)", strokeWidth: 1, strokeDasharray: "3 3" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#111111"
                        strokeWidth={1.2}
                        fill="url(#insightsAreaGrad)"
                        dot={false}
                        activeDot={{ r: 3, fill: "#111111", strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ color: "rgba(0,0,0,0.2)", fontSize: 12 }}>Sin datos</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Bar — income vs expense */}
          <ScrollReveal direction="up" distance={24}>
            <div>
              <Eyebrow right="6 meses">Ingresos vs Gastos</Eyebrow>
              <div style={{ marginTop: 18, background: "#FAFAF8", borderRadius: 28, padding: "24px 20px 12px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={barData} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "rgba(0,0,0,0.25)", fontSize: 10, fontFamily: "Inter, sans-serif", letterSpacing: "0.04em" }}
                      dy={8}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    />
                    <Bar dataKey="Ingresos" fill="rgba(0,0,0,0.25)" radius={[3, 3, 0, 0]} barSize={18} />
                    <Bar dataKey="Gastos" fill="#111111" radius={[3, 3, 0, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Merchants */}
      <ScrollReveal direction="up" distance={20}>
        <div style={{ marginTop: 52 }}>
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
                    <span style={{ flex: 1, fontSize: 13, color: "var(--ink)", letterSpacing: "-0.005em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
      </ScrollReveal>
    </div>
  );
}
