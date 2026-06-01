"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCreateTransaction } from "@/hooks/mutations";
import { useBlocks } from "@/hooks/queries";
import { useCurrency } from "@/hooks/use-currency";
import { useNumberInput } from "@/hooks/use-number-input";
import { BlockGlyph, toGlyphKind, type GlyphKind } from "@/components/ui/primitives";
import { inferCategory } from "@/lib/categorization";
import type { CustomCategory } from "@/lib/custom-categories";

const DEFAULT_EXP_CATS = ["Comida", "Casa", "Transporte", "Ocio", "Salud", "Tecnología", "Educación", "Suscripciones", "Otros"];
const DEFAULT_INC_CATS = ["Salario", "Freelance", "Devolución", "Inversión", "Regalo", "Otros"];

function buildCatList(cats: CustomCategory[] | undefined, type: "expense" | "income"): string[] {
  if (cats && cats.length > 0) {
    const filtered = cats.filter(c => c.type === type).map(c => c.label);
    if (filtered.length > 0) return filtered;
  }
  return type === "expense" ? DEFAULT_EXP_CATS : DEFAULT_INC_CATS;
}

export function QuickExpense({ open, onClose, initialType = "expense", initialBlockId, customCategories }: {
  open: boolean; onClose: () => void; initialType?: "expense" | "income"; initialBlockId?: string;
  customCategories?: CustomCategory[];
}) {
  const [type, setType]         = useState<"expense" | "income">(initialType);
  const [amount, setAmount]     = useState("");
  const [label, setLabel]       = useState("");
  const [category, setCategory] = useState("Comida");
  const [catSource, setCatSource] = useState<"default" | "auto" | "manual">("default");
  const [blockId, setBlockId]   = useState<string | null>(null);
  const [saved, setSaved]       = useState(false);
  const [inputW, setInputW]     = useState(260);
  const [txCurrency, setTxCurrency] = useState<"ARS"|"USD">("ARS");
  const { symbol, format, currency } = useCurrency();
  const createTx                = useCreateTransaction();
  const { data: blocks }        = useBlocks();
  const measureRef              = useRef<HTMLSpanElement>(null);

  const num = useNumberInput({ value: amount, onChange: setAmount, currency, decimals: 2 });

  // Auto-resize input width based on content
  useEffect(() => {
    if (measureRef.current) {
      const w = measureRef.current.offsetWidth + 16; // + padding
      setInputW(Math.max(180, w));
    }
  }, [num.display]);

  useEffect(() => {
    if (open) {
      setSaved(false); setAmount(""); setLabel("");
      setBlockId(initialBlockId ?? null);
      setType(initialType);
      setTxCurrency("ARS");
      const cats = buildCatList(customCategories, initialType);
      setCategory(cats[0] ?? "Otros");
      setCatSource("default");
      setTimeout(() => num.ref.current?.focus(), 60);
    }
  }, [open, initialType, initialBlockId]);

  useEffect(() => {
    const cats = buildCatList(customCategories, type);
    setCategory(cats[0] ?? "Otros");
    setCatSource("default");
  }, [type]);

  // Auto-categorize from description while user hasn't picked manually
  useEffect(() => {
    if (type !== "expense" || catSource === "manual") return;
    const inferred = inferCategory(label);
    if (inferred) {
      setCategory(inferred);
      setCatSource("auto");
    } else if (catSource === "auto") {
      setCategory("Comida");
      setCatSource("default");
    }
  }, [label]);

  const isExp   = type === "expense";
  const cats    = buildCatList(customCategories, type);
  const canSave = num.numericValue > 0;

  const save = () => {
    if (!canSave) return;

    const parsedAmount = num.numericValue;
    const finalAmount  = isExp ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);
    const name         = label.trim() || category;

    const fd = new FormData();
    fd.set("name", name);
    fd.set("amount", String(finalAmount));
    fd.set("category", category);
    fd.set("currency", txCurrency);
    if (label.trim()) fd.set("note", label.trim());
    if (blockId) fd.set("blockId", blockId);

    createTx.mutate(fd, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(onClose, 500);
      },
    });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
  };

  if (!open) return null;

  return (
    <div onMouseDown={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.40)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      paddingTop: "12vh",
      animation: "gp-fade 220ms ease",
    }}>
      <div onMouseDown={e => e.stopPropagation()} onKeyDown={onKey}
        style={{
          width: 540, maxWidth: "92vw",
          background: "var(--bg)", borderRadius: 16,
          boxShadow: "0 28px 80px rgba(0,0,0,0.32), 0 0 0 1px var(--hairline)",
          overflow: "hidden",
          animation: "gp-rise 280ms cubic-bezier(.2,.85,.2,1)",
        }}>

        <AnimatePresence mode="wait">
          {saved ? (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 380 }}
              style={{ padding: "60px 0 50px", textAlign: "center" }}
            >
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 18, stiffness: 400, delay: 0.05 }}
                style={{
                  width: 52, height: 52, borderRadius: 999, background: "var(--ink)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <motion.path
                    d="M4 10.5l4 4 8-9"
                    fill="none" stroke="var(--inverse)" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
                  />
                </svg>
              </motion.div>
              <div className="display" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.03em", color: "var(--ink)", marginBottom: 8 }}>
                {isExp ? "Anotado" : "Recibido"}
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.14em" }}>
                {isExp ? "−" : "+"} {txCurrency === "USD" ? `us$ ${num.numericValue.toFixed(2)}` : format(num.numericValue)} · {category}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {/* Header */}
              <div style={{ padding: "18px 22px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  Nuevo movimiento
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <span className="kbd">esc</span>
                  <span className="kbd">⌘↵ guardar</span>
                </div>
              </div>

              {/* Type toggle */}
              <div style={{ padding: "14px 22px 0" }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr", padding: 4,
                  background: "var(--surface)", borderRadius: 12,
                  border: "1px solid var(--hairline)", position: "relative",
                }}>
                  <motion.div
                    layout
                    style={{
                      position: "absolute", top: 4, bottom: 4,
                      left: isExp ? 4 : "calc(50%)",
                      width: "calc(50% - 4px)",
                      background: "var(--ink)", borderRadius: 9,
                    }}
                    transition={{ type: "spring", damping: 30, stiffness: 380 }}
                  />
                  {[
                    { id: "expense", sym: "−", label: "Gasto" },
                    { id: "income",  sym: "+", label: "Ingreso" },
                  ].map(o => (
                    <button key={o.id} onClick={() => setType(o.id as "expense" | "income")}
                      style={{
                        position: "relative", zIndex: 1, padding: "10px 14px",
                        background: "transparent", border: "none",
                        color: type === o.id ? "var(--inverse)" : "var(--ink)",
                        cursor: "pointer",
                        fontFamily: "'Inter Tight', inherit", fontSize: 13, fontWeight: 500,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        transition: "color 260ms cubic-bezier(.2,.85,.2,1)",
                      }}>
                      <span style={{ fontSize: 18, lineHeight: 1 }}>{o.sym}</span>
                      <span>{o.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div style={{ padding: "22px 22px 14px", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 8 }}>
                  <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                    {symbol}
                  </div>
                  <div style={{ display: "flex", gap: 3 }}>
                    {(["ARS", "USD"] as const).map(c => (
                      <button key={c} type="button" onClick={() => setTxCurrency(c)} style={{
                        padding: "2px 8px", borderRadius: 5,
                        border: `1px solid ${txCurrency === c ? "transparent" : "var(--hairline)"}`,
                        background: txCurrency === c ? "var(--ink)" : "transparent",
                        color: txCurrency === c ? "var(--inverse)" : "var(--faint)",
                        fontSize: 9, fontFamily: "inherit", cursor: "pointer",
                        letterSpacing: "0.12em", textTransform: "uppercase" as const,
                        transition: "all 140ms ease",
                      }}>{c}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "inline-flex", alignItems: "baseline", gap: 4, position: "relative" }}>
                  <motion.span
                    className="display tnum"
                    animate={{ color: isExp ? "var(--faint)" : "var(--ink)" }}
                    transition={{ duration: 0.2 }}
                    style={{ fontSize: 52, fontWeight: 400 }}
                  >
                    {isExp ? "−" : "+"}
                  </motion.span>
                  {/* Hidden span to measure text width */}
                  <span
                    ref={measureRef}
                    aria-hidden
                    style={{
                      position: "absolute", visibility: "hidden", whiteSpace: "pre",
                      fontFamily: "'Inter Tight', inherit", fontSize: 56, fontWeight: 500,
                      letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums",
                      pointerEvents: "none", left: 0, top: 0,
                    }}
                  >
                    {num.display || "0"}
                  </span>
                  <input
                    ref={num.ref}
                    value={num.display}
                    onChange={num.handleChange}
                    onBlur={num.handleBlur}
                    placeholder="0"
                    style={{
                      background: "none", border: "none", outline: "none",
                      fontFamily: "'Inter Tight', inherit", fontSize: 56, fontWeight: 500,
                      letterSpacing: "-0.05em", color: "var(--ink)",
                      width: inputW, minWidth: 120, maxWidth: "calc(100vw - 200px)",
                      textAlign: "left",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  />
                </div>
              </div>

              {/* Fields */}
              <div style={{ padding: "8px 22px 0", display: "grid", gap: 10 }}>
                <div>
                  <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
                    Descripción
                  </div>
                  <input value={label} onChange={e => setLabel(e.target.value)}
                    placeholder="¿En qué?"
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 8,
                      background: "var(--surface)", border: "1px solid var(--hairline)",
                      outline: "none", fontFamily: "inherit", fontSize: 13,
                      color: "var(--ink)", letterSpacing: "-0.005em", boxSizing: "border-box" as const,
                    }} />
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
                    Categoría
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                    {cats.map(c => {
                      const active = category === c;
                      const isAuto = active && catSource === "auto";
                      return (
                        <button key={c} onClick={() => { setCategory(c); setCatSource("manual"); }} style={{
                          padding: "6px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                          background: active ? "var(--ink)" : "var(--surface)",
                          color: active ? "var(--inverse)" : "var(--mute)",
                          boxShadow: `inset 0 0 0 1px ${active ? "transparent" : "var(--hairline)"}`,
                          fontSize: 12, fontFamily: "inherit",
                          transition: "all 140ms ease",
                          display: "flex", alignItems: "center", gap: 5,
                        }}>
                          {c}
                          {isAuto && (
                            <span style={{
                              fontSize: 9, letterSpacing: "0.06em",
                              opacity: 0.6, fontFamily: "inherit",
                            }}>auto</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {blocks && blocks.length > 0 && (
                  <div>
                    <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
                      Bloque <span style={{ opacity: 0.4, textTransform: "none", letterSpacing: 0 }}>Opcional</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                      {blocks.map(b => {
                        const active = blockId === b.id;
                        return (
                          <button
                            key={b.id}
                            onClick={() => setBlockId(active ? null : b.id)}
                            style={{
                              padding: "6px 10px 6px 8px", borderRadius: 7, border: "none", cursor: "pointer",
                              background: active ? "var(--ink)" : "var(--surface)",
                              color: active ? "var(--inverse)" : "var(--mute)",
                              boxShadow: `inset 0 0 0 1px ${active ? "transparent" : "var(--hairline)"}`,
                              fontSize: 12, fontFamily: "inherit",
                              display: "flex", alignItems: "center", gap: 6,
                              transition: "all 140ms ease",
                            }}
                          >
                            <BlockGlyph kind={toGlyphKind(b.icon)} size={11} color={active ? "var(--inverse)" : "var(--mute)"} />
                            {b.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Error */}
              {createTx.isError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ padding: "0 22px" }}
                >
                  <div style={{
                    padding: "9px 12px", borderRadius: 8,
                    background: "rgba(0,0,0,0.05)",
                    fontSize: 12, color: "var(--ink)",
                    fontFamily: "inherit", letterSpacing: "-0.005em",
                  }}>
                    {createTx.error?.message || "Algo salió mal. Intentá de nuevo."}
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div style={{
                padding: "18px 22px 22px", marginTop: 14,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderTop: "1px solid var(--hairline)",
              }}>
                <button onClick={onClose} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, color: "var(--mute)", padding: 0,
                }}>Cancelar</button>
                <motion.button
                  onClick={save}
                  disabled={!canSave || createTx.isPending}
                  whileTap={canSave ? { scale: 0.96 } : {}}
                  style={{
                    padding: "11px 22px", borderRadius: 9,
                    background: canSave && !createTx.isPending ? "var(--ink)" : "var(--surface)",
                    color: canSave && !createTx.isPending ? "var(--inverse)" : "var(--faint)",
                    border: "none", fontFamily: "'Inter Tight', inherit",
                    fontSize: 13, fontWeight: 500, letterSpacing: "-0.005em",
                    cursor: canSave && !createTx.isPending ? "pointer" : "default",
                    display: "flex", alignItems: "center", gap: 8,
                    transition: "background 200ms ease, color 200ms ease",
                  }}>
                  <span>{isExp ? "Anotar gasto" : "Anotar ingreso"}</span>
                  <span className="kbd" style={{ background: "rgba(255,255,255,0.1)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)", color: "inherit" }}>⌘↵</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
