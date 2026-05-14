"use client";

import { motion } from "motion/react";
import type { Category } from "@gastar/shared";

const SHADES = ["#0A0A0A", "#2A2A2A", "#4A4A4A", "#6A6A6A", "#8E8E8E", "#B8B8B8"];

export function CategoryBreakdown({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "#FAFAF8",
          borderRadius: 28,
          padding: 28,
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "rgba(0,0,0,0.2)", fontSize: 12 }}>No spending this month</p>
      </motion.div>
    );
  }

  const total = categories.reduce((s, c) => s + c.amount, 0);
  let cumulativePct = 0;

  const segments = categories.slice(0, 6).map((cat, i) => {
    const pct = cat.amount / total;
    const start = cumulativePct;
    cumulativePct += pct;
    return { ...cat, pct, startPct: start, color: SHADES[i] };
  });

  const R = 44, cx = 56, cy = 56, strokeW = 10;

  function describeArc(startPct: number, endPct: number) {
    const gap = 0.008;
    const s = (startPct + gap) * 2 * Math.PI - Math.PI / 2;
    const e = (endPct - gap) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + R * Math.cos(s), y1 = cy + R * Math.sin(s);
    const x2 = cx + R * Math.cos(e), y2 = cy + R * Math.sin(e);
    return `M ${x1} ${y1} A ${R} ${R} 0 ${endPct - startPct > 0.5 ? 1 : 0} 1 ${x2} ${y2}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "#FAFAF8",
        borderRadius: 28,
        padding: 28,
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
      }}
    >
      <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24 }}>
        By Category
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={112} height={112} viewBox="0 0 112 112">
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth={strokeW} />
            {segments.map((seg, i) => (
              <motion.path
                key={seg.name}
                d={describeArc(seg.startPct, seg.startPct + seg.pct)}
                fill="none" stroke={seg.color} strokeWidth={strokeW} strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.25 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#111111", fontSize: 16, fontWeight: 300, letterSpacing: "-0.5px", lineHeight: 1 }}>
              ${(total / 1000).toFixed(1)}k
            </p>
            <p style={{ color: "rgba(0,0,0,0.3)", fontSize: 9, letterSpacing: "0.06em", marginTop: 3 }}>total</p>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
          {segments.map((cat, i) => (
            <div key={cat.name} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: SHADES[i], flexShrink: 0 }} />
              <span style={{ color: "rgba(0,0,0,0.5)", fontSize: 11, flex: 1 }}>{cat.name}</span>
              <span style={{ color: "#111111", fontSize: 11, fontWeight: 500, letterSpacing: "-0.2px" }}>
                {cat.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
