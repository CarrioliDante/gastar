"use client";

import { motion } from "motion/react";
import type { Installment } from "@gastar/shared";

function RadialProgress({ pct, size = 52 }: { pct: number; size?: number }) {
  const R = (size - 8) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - Math.min(pct, 100) / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={3} />
        <motion.circle
          cx={cx} cy={cy} r={R} fill="none" stroke="#111111" strokeWidth={3} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#111111", fontSize: 11, fontWeight: 500, letterSpacing: "-0.2px" }}>{pct}%</span>
      </div>
    </div>
  );
}

export function InstallmentsCard({ installments }: { installments: Installment[] }) {
  const totalMonthly = installments.reduce((s, i) => s + i.monthly, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "#FAFAF8",
        borderRadius: 28,
        padding: 28,
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Installments
        </p>
        {totalMonthly > 0 && (
          <p style={{ color: "#111111", fontSize: 18, fontWeight: 300, letterSpacing: "-0.6px" }}>
            ${totalMonthly.toLocaleString("en-US")}/mo
          </p>
        )}
      </div>

      {installments.length === 0 ? (
        <p style={{ color: "rgba(0,0,0,0.2)", fontSize: 12, textAlign: "center", padding: "20px 0" }}>
          No active installments
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {installments.map((item, idx) => {
            const pct = Math.round(
              ((item.total_installments - item.remaining) / item.total_installments) * 100
            );
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + idx * 0.08, duration: 0.4 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 0",
                  borderBottom: idx < installments.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                }}
              >
                <RadialProgress pct={pct} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#111111", fontSize: 13, fontWeight: 500, letterSpacing: "-0.3px", marginBottom: 3 }}>
                    {item.name}
                  </p>
                  <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 11 }}>
                    {item.remaining} left · due {item.next_due}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: "#111111", fontSize: 15, fontWeight: 400, letterSpacing: "-0.4px" }}>
                    ${item.monthly.toLocaleString("en-US")}
                  </p>
                  <p style={{ color: "rgba(0,0,0,0.3)", fontSize: 10, marginTop: 2 }}>/ month</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
