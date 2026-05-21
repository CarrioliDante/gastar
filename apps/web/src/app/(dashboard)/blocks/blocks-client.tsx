"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useUIStore } from "@/stores/ui";
import { useBlocks, useBlockTransactions } from "@/hooks/queries";
import { useArchiveBlock } from "@/hooks/mutations";
import type { BlockRow } from "@/hooks/queries";
import {
  BlockGlyph,
  RadialRing,
  H2,
  TxRow,
  Stat,
  toGlyphKind,
  type GlyphKind,
} from "@/components/ui/primitives";
import { CATEGORY_GLYPH } from "@/components/ui/glyph";
import { springGentle } from "@/components/motion/presets";
import { CreateBlockModal } from "@/components/dashboard/create-block-modal";
import { EditBlockModal } from "@/components/dashboard/edit-block-modal";

type Tx = {
  id: string; name: string; category: string;
  amount: number; date: string; time: string;
  note?: string; blockId?: string;
  isoDate: string;
};

const actionLink: React.CSSProperties = {
  padding: "6px 0", background: "none", border: "none",
  fontFamily: "inherit", fontSize: 11, fontWeight: 500,
  color: "var(--mute)", letterSpacing: "0.02em", cursor: "pointer",
  borderBottom: "1px solid transparent",
  transition: "all 180ms",
};

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
  const [selId, setSelId]         = useState(blocks[0]?.id ?? null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit]   = useState(false);
  const { openCapture }           = useUIStore();
  const archiveBlock              = useArchiveBlock();

  const block = blocks.find(b => b.id === selId) ?? blocks[0];
  if (!block) return (
    <>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>
          Sin bloques todavía.
        </div>
        <motion.button
          onClick={() => setShowCreate(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: "9px 18px 9px 14px", borderRadius: 9,
            background: "var(--ink)", color: "var(--inverse)", border: "none",
            fontFamily: "inherit", fontSize: 13, fontWeight: 500,
            letterSpacing: "-0.005em", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Nuevo bloque
        </motion.button>
      </div>
      <CreateBlockModal open={showCreate} onClose={() => setShowCreate(false)} />
    </>
  );

  const pct = block.budget > 0 ? Math.min(1, block.spent / block.budget) : 0;
  const { data: blockTxs, isLoading: txLoading } = useBlockTransactions(block.id);

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
          <motion.button
            onClick={() => setShowCreate(true)}
            whileHover={{ color: "var(--ink)", borderBottomColor: "var(--ink)" }}
            style={{
              padding: "6px 0", background: "none", border: "none",
              fontFamily: "inherit", fontSize: 12, fontWeight: 500,
              color: "var(--mute)", letterSpacing: "-0.005em", cursor: "pointer",
              borderBottom: "1px solid transparent",
              transition: "all 180ms",
            }}
          >
            + Nuevo bloque
          </motion.button>
          <motion.button
            onClick={() => openCapture("expense")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            title="Anotar gasto (⌘N)"
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--ink)", color: "var(--inverse)", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
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
          {blocks.map((b) => {
            const p      = b.budget > 0 ? Math.min(1, b.spent / b.budget) : 0;
            const active = b.id === selId;
            const glyph  = toGlyphKind(b.icon);
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
                  {b.budget > 0 && (
                    <span className="mono tnum" style={{
                      fontSize: 10, color: "var(--mute)", letterSpacing: "0.04em", flexShrink: 0,
                    }}>
                      {Math.round(p * 100)}%
                    </span>
                  )}
                </div>

                <div style={{ height: 1, background: "var(--hairline)", position: "relative" }}>
                  {b.budget > 0 && (
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${p * 100}%` }}
                      transition={{ duration: 1.0, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        position: "absolute", left: 0, top: 0, height: "100%",
                        background: "var(--ink)",
                      }}
                    />
                  )}
                </div>

                <div className="tnum mono" style={{
                  fontSize: 9, color: "var(--mute)", letterSpacing: "0.04em", marginTop: 6,
                }}>
                  {fmtCompact(b.spent)}
                  {b.budget > 0 && (
                    <span style={{ color: "var(--faint)" }}> / {fmtCompact(b.budget)}</span>
                  )}
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
            {block.budget > 0
              ? <RadialRing value={pct} size={120} stroke={1.8} label={Math.round(pct * 100) + "%"} />
              : <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <BlockGlyph kind={toGlyphKind(block.icon)} size={36} />
                </div>
            }
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
              <div style={{ display: "flex", gap: 14, marginTop: 14, alignItems: "center" }}>
                <motion.button
                  onClick={() => setShowEdit(true)}
                  whileHover={{ color: "var(--ink)", borderBottomColor: "var(--ink)" }}
                  style={actionLink}
                >
                  Editar
                </motion.button>
                <motion.button
                  onClick={() => archiveBlock.mutate(block.id)}
                  disabled={archiveBlock.isPending}
                  whileHover={{ color: "var(--ink)", borderBottomColor: "var(--ink)" }}
                  style={{ ...actionLink, opacity: archiveBlock.isPending ? 0.5 : 1 }}
                >
                  Archivar
                </motion.button>
                <motion.button
                  onClick={() => openCapture("expense", block.id)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  title={`Anotar en ${block.name}`}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "var(--ink)", color: "var(--inverse)", border: "none",
                    cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </motion.button>
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
              display: "grid",
              gridTemplateColumns: block.budget > 0 ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
              gap: 24,
              marginTop: 36, paddingTop: 22, paddingBottom: 22,
              borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)",
            }}
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: springGentle } }}>
              <Stat value={block.spent} label="Total gastado" size={22} decimals={0} />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: springGentle } }}>
              <Stat value={block.expenses} label="Movimientos" size={22} decimals={0} />
            </motion.div>
            {block.budget > 0 && (
              <>
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: springGentle } }}>
                  <Stat value={Math.max(0, block.budget - block.spent)} label="Disponible" size={22} decimals={0} />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: springGentle } }}>
                  <Stat value={Math.round(pct * 100)} suffix="%" label="Avance" size={22} />
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Transactions */}
          <H2 top={32} right={blockTxs ? `${blockTxs.length} transacciones` : ""}>
            Transacciones
          </H2>

          {txLoading && (
            <div className="mono" style={{ fontSize: 11, color: "var(--faint)", padding: "20px 0" }}>
              Cargando…
            </div>
          )}

          {!txLoading && blockTxs && blockTxs.length === 0 && (
            <div className="mono" style={{ fontSize: 11, color: "var(--faint)", padding: "20px 0" }}>
              Sin transacciones en este bloque todavía.
            </div>
          )}

          {!txLoading && blockTxs && blockTxs.map((t, i, arr) => (
            <div key={t.id} style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--hairline)" : "none" }}>
              <TxRow
                tx={{
                  label: t.name,
                  glyph: CATEGORY_GLYPH[t.category] as GlyphKind | undefined,
                  meta: `${t.category} · ${t.date}`,
                  amount: t.amount,
                }}
              />
            </div>
          ))}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <CreateBlockModal open={showCreate} onClose={() => setShowCreate(false)} />
      <EditBlockModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        block={{ id: block.id, name: block.name, icon: block.icon, budget: block.budget, goal: block.goal ?? "" }}
      />
    </>
  );
}
