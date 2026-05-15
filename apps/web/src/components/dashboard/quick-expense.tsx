"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCreateTransaction } from "@/hooks/mutations";
import { useCurrency } from "@/hooks/use-currency";

const EXP_CATS = ["Comida", "Casa", "Transporte", "Ocio", "Salud", "Tecnología", "Educación", "Suscripciones", "Otros"];
const INC_CATS = ["Salario", "Freelance", "Devolución", "Inversión", "Regalo", "Otros"];

export function QuickExpense({ open, onClose, initialType = "expense" }: { open: boolean; onClose: () => void; initialType?: "expense" | "income" }) {
  const [type, setType]         = useState<"expense" | "income">(initialType);
  const [amount, setAmount]     = useState("");
  const [label, setLabel]       = useState("");
  const [category, setCategory] = useState("Comida");
  const [saved, setSaved]       = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);
  const { symbol, format }      = useCurrency();
  const createTx                = useCreateTransaction();

  useEffect(() => {
    if (open) {
      setSaved(false); setAmount(""); setLabel("");
      setType(initialType); setCategory(initialType === "income" ? "Salario" : "Comida");
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open, initialType]);

  useEffect(() => {
    setCategory(type === "income" ? "Salario" : "Comida");
  }, [type]);

  const isExp   = type === "expense";
  const cats    = isExp ? EXP_CATS : INC_CATS;
  const canSave = amount.length > 0 && parseFloat(amount) > 0;

  const save = () => {
    if (!canSave) return;

    const parsedAmount = parseFloat(amount);
    const finalAmount  = isExp ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);
    const name         = label.trim() || category;

    const fd = new FormData();
    fd.set("name", name);
    fd.set("amount", String(finalAmount));
    fd.set("category", category);
    if (label.trim()) fd.set("note", label.trim());

    // Mutation handles optimistic update + invalidation automatically
    createTx.mutate(fd);

    setSaved(true);
    setTimeout(onClose, 500);
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
                {isExp ? "−" : "+"} {format(parseFloat(amount) || 0)} · {category}
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
                <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
                  {symbol}
                </div>
                <div style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
                  <motion.span
                    className="display tnum"
                    animate={{ color: isExp ? "var(--faint)" : "var(--ink)" }}
                    transition={{ duration: 0.2 }}
                    style={{ fontSize: 52, fontWeight: 400 }}
                  >
                    {isExp ? "−" : "+"}
                  </motion.span>
                  <input ref={inputRef} value={amount} type="number"
                    onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                    placeholder="0"
                    style={{
                      background: "none", border: "none", outline: "none",
                      fontFamily: "'Inter Tight', inherit", fontSize: 56, fontWeight: 500,
                      letterSpacing: "-0.05em", color: "var(--ink)",
                      width: 260, textAlign: "left",
                      fontVariantNumeric: "tabular-nums",
                    }} />
                </div>
                {parseFloat(amount) >= 1000 && (
                  <div className="mono" style={{
                    fontSize: 11, color: "var(--faint)", letterSpacing: "0.06em",
                    marginTop: 6,
                  }}>
                    {format(parseFloat(amount))}
                  </div>
                )}
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
                    {cats.map(c => (
                      <button key={c} onClick={() => setCategory(c)} style={{
                        padding: "6px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                        background: category === c ? "var(--ink)" : "var(--surface)",
                        color: category === c ? "var(--inverse)" : "var(--mute)",
                        boxShadow: `inset 0 0 0 1px ${category === c ? "transparent" : "var(--hairline)"}`,
                        fontSize: 12, fontFamily: "inherit",
                        transition: "all 140ms ease",
                      }}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>

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
