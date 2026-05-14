"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Transaction } from "@gastar/shared";

const EMOJI: Record<string, string> = {
  Food: "🍜",
  Income: "↗",
  Leisure: "◈",
  Transport: "◎",
  Health: "○",
  Housing: "□",
};

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "#FAFAF8",
        borderRadius: 28,
        padding: 28,
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Recent
        </p>
        <Link href="/transactions" style={{ color: "rgba(0,0,0,0.3)", fontSize: 11, letterSpacing: "0.04em", textDecoration: "none" }}>
          All →
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p style={{ color: "rgba(0,0,0,0.2)", fontSize: 12, textAlign: "center", padding: "24px 0" }}>
          No transactions yet
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {transactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.04, duration: 0.35 }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "11px 0",
                borderBottom: i < transactions.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: "rgba(0,0,0,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, flexShrink: 0, color: "#111111",
                  }}
                >
                  {EMOJI[tx.category] ?? "·"}
                </div>
                <div>
                  <p style={{ color: "#111111", fontSize: 13, fontWeight: 500, letterSpacing: "-0.3px" }}>{tx.name}</p>
                  <p style={{ color: "rgba(0,0,0,0.3)", fontSize: 10, marginTop: 1 }}>{tx.date}</p>
                </div>
              </div>
              <p style={{ color: "#111111", fontSize: 13, fontWeight: 400, letterSpacing: "-0.3px", opacity: tx.amount < 0 ? 0.6 : 1 }}>
                {tx.amount > 0 ? "+" : "−"}${Math.abs(tx.amount).toFixed(2)}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
