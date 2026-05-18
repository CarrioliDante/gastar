"use client";

import { motion } from "motion/react";
import { BlockGlyph, type GlyphKind } from "@/components/ui/primitives";
import { CATEGORY_GLYPH } from "@/components/ui/glyph";
import type { Category } from "@gastar/shared";
import { springGentle } from "@/components/motion/presets";

function fmtAmount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

export function CategoryBreakdown({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return (
      <div className="mono" style={{ fontSize: 11, color: "var(--faint)", padding: "12px 0" }}>
        Sin gastos este mes.
      </div>
    );
  }

  const top = categories.slice(0, 6);
  const max = top[0]?.amount ?? 1;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
      style={{ display: "flex", flexDirection: "column" }}
    >
      {top.map((cat, i) => {
        const glyphKind = (CATEGORY_GLYPH[cat.name] as GlyphKind | undefined) ?? "Home";
        const barW = max > 0 ? (cat.amount / max) * 100 : 0;
        return (
          <motion.div
            key={cat.name}
            variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0, transition: springGentle } }}
          >
            {i > 0 && <div style={{ height: 1, background: "var(--hairline)" }} />}
            <div style={{ padding: "11px 0", display: "flex", alignItems: "center", gap: 12 }}>
              <BlockGlyph kind={glyphKind} size={14} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                  <span className="body-font" style={{
                    fontSize: 13, fontWeight: 500, color: "var(--ink)",
                    letterSpacing: "-0.005em", whiteSpace: "nowrap" as const,
                    overflow: "hidden", textOverflow: "ellipsis", maxWidth: "60%",
                  }}>
                    {cat.name}
                  </span>
                  <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexShrink: 0 }}>
                    <span className="mono tnum" style={{ fontSize: 10, color: "var(--mute)" }}>
                      {cat.percent}%
                    </span>
                    <span className="tnum display" style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.01em" }}>
                      {fmtAmount(cat.amount)}
                    </span>
                  </div>
                </div>
                <div style={{ height: 1.5, background: "var(--hairline)", borderRadius: 99, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${barW}%` }}
                    transition={{ duration: 0.8, delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: "100%", background: "var(--ink)", borderRadius: 99 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
