"use client";

import { motion } from "motion/react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fmt } from "@/lib/utils";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import type { SpendingPoint, MonthlyStats } from "@gastar/shared";

interface Props {
  trend: SpendingPoint[];
  monthly: MonthlyStats;
}

export function SpendingChart({ trend, monthly }: Props) {
  const avg = trend.length > 0
    ? Math.round(trend.reduce((s, p) => s + p.amount, 0) / trend.length)
    : 0;

  const currentMonth = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "#FAFAF8",
        borderRadius: 28,
        padding: "28px 28px 20px",
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
            Monthly Spending
          </p>
          <p style={{ color: "#111111", fontSize: 42, fontWeight: 200, letterSpacing: "-2px", lineHeight: 1 }}>
            {fmt.currency(monthly.spending)}
          </p>
          <p style={{ color: "rgba(0,0,0,0.3)", fontSize: 12, marginTop: 6, letterSpacing: "-0.2px" }}>
            {currentMonth}
          </p>
        </div>
        {avg > 0 && (
          <div style={{ textAlign: "right", paddingTop: 4 }}>
            <p style={{ color: "rgba(0,0,0,0.25)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
              Avg/month
            </p>
            <p style={{ color: "rgba(0,0,0,0.55)", fontSize: 18, fontWeight: 300, letterSpacing: "-0.6px" }}>
              {fmt.currency(avg)}
            </p>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        {trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={trend} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
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
                content={<ChartTooltip formatValue={(v: number) => fmt.currency(v)} />}
                cursor={{ stroke: "rgba(0,0,0,0.08)", strokeWidth: 1, strokeDasharray: "3 3" }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#111111"
                strokeWidth={1.2}
                fill="url(#areaGrad)"
                dot={false}
                activeDot={{ r: 3, fill: "#111111", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "rgba(0,0,0,0.2)", fontSize: 12 }}>No data yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
