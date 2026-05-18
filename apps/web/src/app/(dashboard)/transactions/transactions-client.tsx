"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useUIStore } from "@/stores/ui";
import { useAllTransactions, useBlocks } from "@/hooks/queries";
import { useDeleteTransaction } from "@/hooks/mutations";
import type { TransactionRow, BlockRow } from "@/hooks/queries";
import {
  BlockGlyph,
  Hairline,
  Stat,
  type GlyphKind,
} from "@/components/ui/primitives";
import { CATEGORY_GLYPH } from "@/components/ui/glyph";
import { springGentle } from "@/components/motion/presets";

type Tx = TransactionRow;

interface Props {
  initialTransactions: Tx[];
  initialBlocks: BlockRow[];
}

type SortCol = "isoDate" | "name" | "category" | "amount";
type SortDir = "asc" | "desc";

const TABS = ["Todo", "Salida", "Entrada", "Cuotas", "Recurrentes"] as const;
type Tab = typeof TABS[number];

function ghostBtn(): React.CSSProperties {
  return {
    padding: "7px 12px", borderRadius: 8,
    background: "var(--surface)", color: "var(--ink)",
    border: "1px solid var(--hairline)",
    fontFamily: "inherit", fontSize: 12, fontWeight: 500,
    letterSpacing: "-0.005em", cursor: "pointer",
  };
}

export function TransactionsClient({ initialTransactions, initialBlocks }: Props) {
  const { openCapture } = useUIStore();
  const { data: transactions } = useAllTransactions(initialTransactions);
  const { data: blocksRaw } = useBlocks(initialBlocks);
  const deleteTx = useDeleteTransaction();

  const [tab, setTab]               = useState<Tab>("Todo");
  const [q, setQ]                   = useState("");
  const [catFilter, setCatFilter]   = useState("Todas");
  const [monthFilter, setMonthFilter] = useState("Todos");
  const [sort, setSort]             = useState<{ col: SortCol; dir: SortDir }>({ col: "isoDate", dir: "desc" });

  const blocks = blocksRaw ?? [];
  const txs = transactions ?? [];

  const blockMap = new Map(blocks.map(b => [b.id, b.name]));
  const cats     = ["Todas", ...Array.from(new Set(txs.map(t => t.category))).sort()];

  const months = ["Todos", ...Array.from(new Set(txs.map(t => t.isoDate.slice(0, 7)))).sort().reverse()];
  const fmtMonth = (m: string) => {
    if (m === "Todos") return "Todos los meses";
    const [y, mo] = m.split("-");
    return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  };

  let filtered = txs.slice();
  if (tab === "Salida")           filtered = filtered.filter(t => t.amount < 0);
  if (tab === "Entrada")          filtered = filtered.filter(t => t.amount > 0);
  if (catFilter !== "Todas")      filtered = filtered.filter(t => t.category === catFilter);
  if (monthFilter !== "Todos")    filtered = filtered.filter(t => t.isoDate.startsWith(monthFilter));
  if (q) {
    const Q = q.toLowerCase();
    filtered = filtered.filter(t => (t.name + " " + t.category + " " + (t.note ?? "")).toLowerCase().includes(Q));
  }

  filtered.sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    if (sort.col === "amount")  return (a.amount - b.amount) * dir;
    if (sort.col === "isoDate") return a.isoDate.localeCompare(b.isoDate) * dir;
    const va = String((a as unknown as Record<string, unknown>)[sort.col] ?? "");
    const vb = String((b as unknown as Record<string, unknown>)[sort.col] ?? "");
    return va.localeCompare(vb) * dir;
  });

  const outflow = filtered.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const inflow  = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const net     = filtered.reduce((s, t) => s + t.amount, 0);

  const toggleSort = (col: SortCol) =>
    setSort(s => ({ col, dir: s.col === col && s.dir === "desc" ? "asc" : "desc" }));

  const handleDelete = (id: string) => {
    if (id.startsWith("opt-")) return;
    deleteTx.mutate(id);
  };

  const SortTh = ({ col, children, align = "left" }: {
    col: SortCol; children: React.ReactNode; align?: "left" | "right";
  }) => (
    <th onClick={() => toggleSort(col)} style={{
      textAlign: align, padding: "10px 12px",
      cursor: "pointer", userSelect: "none",
      fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 500,
      color: "var(--mute)", letterSpacing: "0.16em", textTransform: "uppercase",
      borderBottom: "1px solid var(--hairline)", whiteSpace: "nowrap",
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {children}
        {sort.col === col && (
          <span style={{ fontSize: 8, color: "var(--ink)" }}>
            {sort.dir === "desc" ? "↓" : "↑"}
          </span>
        )}
      </span>
    </th>
  );

  return (
    <>
      {/* ── TopBar ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px 0", gap: 16,
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
            {txs.length} total · {filtered.length} visibles
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
            Movimientos
          </motion.h1>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.25 }}
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <button style={ghostBtn()}>Exportar CSV</button>
          <button style={ghostBtn()}>Filtros</button>
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

      <div style={{ flex: 1, overflowY: "auto", padding: "0 40px 80px" }}>

        {/* ── Tabs + filters ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 28, gap: 16,
        }}>
          <div style={{ display: "flex", gap: 22 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "10px 0", background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 13, fontWeight: 500,
                color: tab === t ? "var(--ink)" : "var(--faint)",
                borderBottom: tab === t ? "1.5px solid var(--ink)" : "1.5px solid transparent",
                letterSpacing: "-0.005em", transition: "all 200ms",
              }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              style={{
                padding: "7px 28px 7px 12px", borderRadius: 8,
                background: "var(--surface)", color: "var(--ink)",
                border: "1px solid var(--hairline)", outline: "none",
                fontFamily: "inherit", fontSize: 12, letterSpacing: "-0.005em",
                appearance: "none", cursor: "pointer",
              }}
            >
              {months.map(m => <option key={m} value={m}>{fmtMonth(m)}</option>)}
            </select>
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              style={{
                padding: "7px 28px 7px 12px", borderRadius: 8,
                background: "var(--surface)", color: "var(--ink)",
                border: "1px solid var(--hairline)", outline: "none",
                fontFamily: "inherit", fontSize: 12, letterSpacing: "-0.005em",
                appearance: "none", cursor: "pointer",
              }}
            >
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
              borderRadius: 8, background: "var(--surface)", border: "1px solid var(--hairline)",
            }}>
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <circle cx="6.2" cy="6.2" r="4.5" stroke="var(--mute)" strokeWidth="1.3"/>
                <line x1="9.6" y1="9.6" x2="12.5" y2="12.5" stroke="var(--mute)" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                value={q} onChange={e => setQ(e.target.value)}
                placeholder="Buscar"
                style={{
                  background: "none", border: "none", outline: "none",
                  fontFamily: "inherit", fontSize: 12, color: "var(--ink)", width: 140,
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Summary bar ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } },
          }}
          style={{
            display: "flex", gap: 40, padding: "22px 0",
            borderBottom: "1px solid var(--hairline)", marginTop: 4,
          }}
        >
          {[
            { value: outflow, label: "Salidas" },
            { value: inflow,  label: "Entradas" },
            { value: net,     label: "Neto" },
            { value: filtered.length, label: "Movimientos" },
          ].map(s => (
            <motion.div
              key={s.label}
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: springGentle } }}
            >
              <Stat value={s.value} label={s.label} size={20} decimals={0} />
            </motion.div>
          ))}
        </motion.div>

        {/* ── Table ── */}
        {txs.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "80px 0", gap: 16,
          }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.06em", textAlign: "center" }}>
              Aún no registraste ningún movimiento.
            </div>
            <button
              onClick={() => openCapture("expense")}
              style={{
                padding: "9px 18px", borderRadius: 9,
                background: "var(--ink)", color: "var(--inverse)", border: "none",
                fontFamily: "inherit", fontSize: 12, fontWeight: 500,
                letterSpacing: "-0.005em", cursor: "pointer",
              }}
            >
              Anotar gasto
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mono" style={{ fontSize: 11, color: "var(--faint)", padding: "48px 0" }}>
            Sin movimientos que coincidan con los filtros.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{
                  padding: "10px 12px", width: 28,
                  borderBottom: "1px solid var(--hairline)",
                }}>
                  <input type="checkbox" style={{ accentColor: "var(--ink)" }} />
                </th>
                <SortTh col="isoDate">Fecha</SortTh>
                <SortTh col="name">Descripción</SortTh>
                <SortTh col="category">Categoría</SortTh>
                <th style={{
                  padding: "10px 12px",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 500,
                  color: "var(--mute)", letterSpacing: "0.16em", textTransform: "uppercase",
                  borderBottom: "1px solid var(--hairline)", textAlign: "left",
                }}>Bloque</th>
                <SortTh col="amount" align="right">Monto</SortTh>
                <th style={{ width: 36, borderBottom: "1px solid var(--hairline)" }} />
              </tr>
            </thead>
            <motion.tbody
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.025, delayChildren: 0.4 } },
              }}
            >
              {filtered.map(t => {
                const pos = t.amount >= 0;
                const blockName  = t.blockId ? blockMap.get(t.blockId) : null;
                const glyphKind: GlyphKind = (CATEGORY_GLYPH[t.category] as GlyphKind | undefined) ?? "Home";
                const isOpt = t.id.startsWith("opt-");
                return (
                  <motion.tr
                    key={t.id}
                    className="row-hover"
                    variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: isOpt ? 0.55 : 1, y: 0, transition: springGentle } }}
                    style={{
                      borderBottom: "1px solid var(--hairline)",
                      transition: "opacity 200ms",
                    }}
                  >
                    <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                      <input type="checkbox" style={{ accentColor: "var(--ink)" }} />
                    </td>

                    <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                      <div className="mono tnum" style={{
                        fontSize: 11, color: "var(--mute)", letterSpacing: "0.04em",
                      }}>
                        {t.date} · {t.time}
                      </div>
                    </td>

                    <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <BlockGlyph kind={glyphKind} size={14} />
                        <div>
                          <div className="body-font" style={{
                            fontSize: 13, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em",
                          }}>
                            {t.name}
                          </div>
                          {t.note && (
                            <div className="mono" style={{
                              fontSize: 10, color: "var(--faint)", letterSpacing: "0.04em", marginTop: 1,
                            }}>
                              {t.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                      <span className="body-font" style={{
                        fontSize: 12, color: "var(--mute)", letterSpacing: "-0.005em",
                      }}>
                        {t.category}
                      </span>
                    </td>

                    <td style={{ padding: "11px 12px", verticalAlign: "middle" }}>
                      {blockName ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "3px 8px", borderRadius: 99,
                          background: "var(--surface-alt)",
                          fontSize: 11, color: "var(--ink)", letterSpacing: "-0.005em", fontWeight: 500,
                        }}>
                          {blockName}
                        </span>
                      ) : (
                        <span className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.06em" }}>
                          —
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "11px 12px", verticalAlign: "middle", textAlign: "right" }}>
                      <span className="tnum display" style={{
                        fontSize: 14, fontWeight: 500, letterSpacing: "-0.015em", color: "var(--ink)",
                      }}>
                        <span style={{ color: pos ? "var(--ink)" : "var(--faint)" }}>{pos ? "+" : "−"}</span>
                        {Math.abs(t.amount).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td style={{ padding: "6px 12px", verticalAlign: "middle", textAlign: "center" }}>
                      <button
                        className="del-btn"
                        title="Eliminar"
                        onClick={() => handleDelete(t.id)}
                        disabled={isOpt || deleteTx.isPending}
                      >×</button>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        )}
      </div>
    </>
  );
}
