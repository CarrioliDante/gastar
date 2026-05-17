"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useUIStore } from "@/stores/ui";
import { useBlocks } from "@/hooks/queries";
import { useArchiveBlock } from "@/hooks/mutations";
import type { BlockRow } from "@/hooks/queries";
import {
  BlockGlyph,
  RadialRing,
  BarChart,
  Hairline,
  H2,
  TxRow,
  Stat,
  type GlyphKind,
} from "@/components/ui/primitives";
import { CATEGORY_GLYPH } from "@/components/ui/glyph";
import { springGentle } from "@/components/motion/presets";

type Tx = {
  id: string; name: string; category: string;
  amount: number; date: string; time: string;
  note?: string; blockId?: string;
  isoDate: string;
};

const BLOCK_GLYPHS: GlyphKind[] = ["square", "circle", "arc", "diamond", "cross", "ring"];

function ghostBtn(): React.CSSProperties {
  return {
    padding: "7px 12px", borderRadius: 8,
    background: "var(--surface)", color: "var(--ink)",
    border: "1px solid var(--hairline)",
    fontFamily: "inherit", fontSize: 12, fontWeight: 500,
    letterSpacing: "-0.005em", cursor: "pointer",
  };
}

function fmtCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (abs / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1_000)     return (abs / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return abs.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function BlocksClient({
  initialBlocks,
}: {
  initialBlocks: BlockRow[];
}) {
  const { data: blocksRaw } = useBlocks(initialBlocks);
  const blocks = blocksRaw ?? [];
  const [selId, setSelId] = useState(blocks[0]?.id ?? null);
  const { openCapture }   = useUIStore();
  const archiveBlock      = useArchiveBlock();

  const block = blocks.find(b => b.id === selId) ?? blocks[0];
  if (!block) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>
        Sin bloques todavía. Usá el comando para crear el primero.
      </div>
    </div>
  );

  const pct = block.budget > 0 ? Math.min(1, block.spent / block.budget) : 0;

  // 14-day synthetic trend
  const trend = Array.from({ length: 14 }, (_, i) =>
    20 + Math.sin(i * 0.6) * 8 + Math.cos(i * 1.3) * 4 + 12
  );

  return (
    <>
      {/* ── TopBar ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px 0", gap: 16, flexShrink: 0,
      }}>
        <div>
          <motion.div
            className="mono"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springGentle, delay: 0.05 }}
            style={{
              fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em",
              textTransform: "uppercase", marginBottom: 8,
            }}
          >
            {blocks.length} activos · 1 archivado
          </motion.div>
          <motion.h1
            className="display"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springGentle, delay: 0.1 }}
            style={{
              margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em",
              color: "var(--ink)", lineHeight: 1,
            }}
          >
            Bloques de vida
          </motion.h1>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.25 }}
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <button style={ghostBtn()}>+ Nuevo bloque</button>
          <motion.button
            onClick={() => openCapture("expense")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "7px 12px 7px 9px", borderRadius: 8,
              background: "var(--ink)", color: "var(--inverse)", border: "none",
              fontFamily: "inherit", fontSize: 12, fontWeight: 500,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11">
              <line x1="5.5" y1="2" x2="5.5" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="2" y1="5.5" x2="9" y2="5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span>Anotar</span>
            <span className="kbd" style={{
              background: "rgba(255,255,255,0.1)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
              color: "inherit",
            }}>⌘N</span>
          </motion.button>
        </motion.div>
      </header>

      {/* ── Split view ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", padding: "20px 40px 20px", gap: 0, minHeight: 0 }}>

        {/* Left: block list */}
        <div style={{
          width: 340, flexShrink: 0, overflowY: "auto",
          borderRight: "1px solid var(--hairline)", paddingRight: 14,
        }}>
          <div className="mono" style={{
            fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em",
            textTransform: "uppercase", padding: "8px 12px 6px",
          }}>
            Bloques · {blocks.length}
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.04, delayChildren: 0.15 } },
            }}
          >
          {blocks.map((b, idx) => {
            const p      = b.budget > 0 ? Math.min(1, b.spent / b.budget) : 0;
            const active = b.id === selId;
            const glyph: GlyphKind = BLOCK_GLYPHS[idx % BLOCK_GLYPHS.length];
            return (
              <motion.button
                key={b.id}
                onClick={() => setSelId(b.id)}
                className="row-hover"
                variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0, transition: springGentle } }}
                style={{
                  width: "100%", padding: "14px 12px", borderRadius: 10,
                  background: active ? "var(--surface)" : "transparent",
                  border: "none", cursor: "pointer", textAlign: "left",
                  boxShadow: active ? "inset 0 0 0 1px var(--hairline)" : "none",
                  display: "block", marginBottom: 4, transition: "all 180ms",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <BlockGlyph kind={glyph} size={20} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="body-font" style={{
                      fontSize: 14, fontWeight: 500, letterSpacing: "-0.005em", color: "var(--ink)",
                    }}>
                      {b.name}
                    </div>
                    <div className="mono" style={{
                      fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 2,
                    }}>
                      {b.expenses} mov · {b.goal || "Sin objetivo"}
                    </div>
                  </div>
                  <span className="mono tnum" style={{
                    fontSize: 10, color: "var(--mute)", letterSpacing: "0.04em", flexShrink: 0,
                  }}>
                    {Math.round(p * 100)}%
                  </span>
                </div>

                <div style={{ height: 1, background: "var(--hairline)", position: "relative" }}>
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${p * 100}%` }}
                    transition={{ duration: 1.0, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: "absolute", left: 0, top: 0, height: "100%",
                      background: "var(--ink)",
                    }}
                  />
                </div>

                <div className="tnum mono" style={{
                  fontSize: 9, color: "var(--mute)", letterSpacing: "0.04em", marginTop: 6,
                }}>
                  {fmtCompact(b.spent)}{" "}
                  <span style={{ color: "var(--faint)" }}>/ {fmtCompact(b.budget)}</span>
                </div>
              </motion.button>
            );
          })}
          </motion.div>
        </div>

        {/* Right: detail */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 36px 40px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={springGentle}
            >

          <div style={{ display: "flex", alignItems: "flex-start", gap: 28, paddingTop: 20 }}>
            <RadialRing value={pct} size={120} stroke={1.8} />
            <div style={{ flex: 1, paddingTop: 8 }}>
              <div className="mono" style={{
                fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase",
              }}>
                Bloque · {block.expenses} movimientos
              </div>
              <h2 className="display" style={{
                margin: "8px 0 4px", fontSize: 36, fontWeight: 500,
                letterSpacing: "-0.04em", color: "var(--ink)", lineHeight: 1,
              }}>
                {block.name}
              </h2>
              {block.goal && (
                <p className="body-font" style={{
                  margin: 0, fontSize: 14, color: "var(--mute)", letterSpacing: "-0.005em",
                }}>
                  {block.goal}
                </p>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button style={ghostBtn()}>Editar</button>
                <button
                  onClick={() => archiveBlock.mutate(block.id)}
                  disabled={archiveBlock.isPending}
                  style={ghostBtn()}
                >
                  Archivar
                </button>
                <button
                  onClick={() => openCapture("expense")}
                  style={{ ...ghostBtn(), background: "var(--ink)", color: "var(--inverse)", border: "none" }}
                >
                  + Anotar en este bloque
                </button>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
            }}
            style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
              marginTop: 36, paddingTop: 22, paddingBottom: 22,
              borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)",
            }}
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: springGentle } }}>
              <Stat value={block.spent} label="Gastado" size={22} decimals={0} />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: springGentle } }}>
              <Stat value={Math.max(0, block.budget - block.spent)} label="Disponible" size={22} decimals={0} />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: springGentle } }}>
              <Stat value={block.budget} label="Presupuesto" size={22} decimals={0} />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: springGentle } }}>
              <Stat value={Math.round(pct * 100)} suffix="%" label="Avance" size={22} />
            </motion.div>
          </motion.div>

          {/* Trend bar chart */}
          <H2 top={32} right="Tendencia">Tendencia · 14 días</H2>
          <BarChart data={trend} width={700} height={70} gap={4} />

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
