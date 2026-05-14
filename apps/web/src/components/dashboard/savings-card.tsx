"use client";

import { motion } from "motion/react";
import { fmt } from "@/lib/utils";
import type { MonthlyStats } from "@gastar/shared";

export function SavingsCard({ monthly }: { monthly: MonthlyStats }) {
  const pct = monthly.savingsGoal > 0
    ? Math.min(Math.round((monthly.savings / monthly.savingsGoal) * 100), 100)
    : 0;
  const R = 36;
  const circumference = 2 * Math.PI * R;
  const offset = circumference * (1 - pct / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "#FAFAF8",
        borderRadius: 28,
        padding: 28,
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 160,
      }}
    >
      <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        Savings
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 16 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={88} height={88} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={44} cy={44} r={R} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={5} />
            <motion.circle
              cx={44} cy={44} r={R}
              fill="none" stroke="#111111" strokeWidth={5} strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#111111", fontSize: 16, fontWeight: 300, letterSpacing: "-0.4px" }}>{pct}%</span>
          </div>
        </div>

        <div>
          <p style={{ color: "#111111", fontSize: 28, fontWeight: 200, letterSpacing: "-1px", lineHeight: 1 }}>
            {fmt.currency(monthly.savings)}
          </p>
          <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 11, marginTop: 5, letterSpacing: "-0.2px" }}>
            of {fmt.currency(monthly.savingsGoal)} goal
          </p>
          <div style={{ marginTop: 14, height: 2, width: 80, borderRadius: 2, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: "100%", background: "#111111", borderRadius: 2 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
