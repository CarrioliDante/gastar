"use client";

import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { balanceData, monthlyStats } from "@/data/mock";
import { fmt } from "@/lib/utils";

export function BalanceCard({ onQuickAdd }: { onQuickAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "#0A0A0A",
        borderRadius: 28,
        padding: "32px 36px 28px",
        position: "relative",
        overflow: "hidden",
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Noise texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: 0.4,
          pointerEvents: "none",
          borderRadius: 28,
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>
            Net Worth
          </p>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ color: "#F5F5F2", fontSize: 68, fontWeight: 200, letterSpacing: "-3px", lineHeight: 1 }}
          >
            {fmt.currency(balanceData.total)}
          </motion.p>
        </div>

        <motion.button
          whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.15)" }}
          whileTap={{ scale: 0.93 }}
          onClick={onQuickAdd}
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.7)",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
        >
          <Plus size={16} strokeWidth={2} />
        </motion.button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingTop: 20,
          marginTop: 20,
        }}
      >
        {[
          { label: "Income", value: fmt.currency(monthlyStats.income, true) },
          { label: "Spending", value: fmt.currency(monthlyStats.spending, true) },
          { label: "Saved", value: fmt.currency(monthlyStats.savings, true) },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              paddingLeft: i > 0 ? 20 : 0,
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.07)" : "none",
              marginLeft: i > 0 ? 20 : 0,
            }}
          >
            <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5 }}>
              {stat.label}
            </p>
            <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 18, fontWeight: 300, letterSpacing: "-0.6px" }}>
              {stat.value}
            </p>
          </div>
        ))}

        <div style={{ marginLeft: "auto", paddingLeft: 20 }}>
          <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.07)", borderRadius: 20, padding: "5px 10px" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "-0.2px" }}>
              +{balanceData.change}% this month
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
