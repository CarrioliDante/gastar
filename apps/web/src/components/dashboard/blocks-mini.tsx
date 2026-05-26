"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Block } from "@gastar/shared";

export function BlocksMini({ blocks }: { blocks: Block[] }) {
  const shown = blocks.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "#FAFAF8",
        borderRadius: 28,
        padding: 28,
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Life Blocks
        </p>
        <Link href="/blocks" style={{ color: "rgba(0,0,0,0.3)", fontSize: 11, textDecoration: "none" }}>
          All →
        </Link>
      </div>

      {shown.length === 0 ? (
        <p style={{ color: "rgba(0,0,0,0.2)", fontSize: 12, textAlign: "center", padding: "24px 0" }}>
          No blocks yet
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {shown.map((block, i) => {
            const pct = block.budget > 0 ? Math.min(Math.round((block.spent / block.budget) * 100), 100) : 0;
            return (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -2 }}
                transition={{ delay: 0.36 + i * 0.06, duration: 0.4 }}
                style={{ background: "rgba(0,0,0,0.03)", borderRadius: 18, padding: 16, cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <span style={{ fontSize: 22 }}>{block.icon}</span>
                  <span style={{ color: "rgba(0,0,0,0.3)", fontSize: 10, fontWeight: 500 }}>{pct}%</span>
                </div>
                <p style={{ color: "#111111", fontSize: 13, fontWeight: 500, letterSpacing: "-0.3px", marginBottom: 3 }}>
                  {block.name}
                </p>
                <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 10, marginBottom: 12 }}>
                  ${block.spent.toLocaleString("es-AR")} spent
                </p>
                <div style={{ height: 2, background: "rgba(0,0,0,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.45 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: "100%", background: "#111111", borderRadius: 2 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
