"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCreateBlock } from "@/hooks/mutations";
import { useCurrency } from "@/hooks/use-currency";
import { useNumberInput } from "@/hooks/use-number-input";
import { BlockGlyph, type TablerGlyphKind } from "@/components/ui/primitives";

interface IconCategory {
  label: string;
  icons: { kind: TablerGlyphKind; label: string }[];
}

const ICON_CATEGORIES: IconCategory[] = [
  {
    label: "Vivienda",
    icons: [
      { kind: "Home", label: "Home" },
      { kind: "Building", label: "Building" },
      { kind: "Key", label: "Key" },
      { kind: "Bulb", label: "Bulb" },
      { kind: "Flame", label: "Flame" },
      { kind: "Droplet", label: "Droplet" },
    ],
  },
  {
    label: "Transporte",
    icons: [
      { kind: "Car", label: "Car" },
      { kind: "Bike", label: "Bike" },
      { kind: "Plane", label: "Plane" },
      { kind: "Train", label: "Train" },
      { kind: "Bus", label: "Bus" },
      { kind: "GasStation", label: "Gas Station" },
    ],
  },
  {
    label: "Salud",
    icons: [
      { kind: "Heart", label: "Heart" },
      { kind: "Activity", label: "Activity" },
      { kind: "Barbell", label: "Barbell" },
      { kind: "Apple", label: "Apple" },
      { kind: "FirstAidKit", label: "First Aid" },
      { kind: "Run", label: "Run" },
    ],
  },
  {
    label: "Comida y Compras",
    icons: [
      { kind: "Coffee", label: "Coffee" },
      { kind: "ToolsKitchen2", label: "Kitchen" },
      { kind: "ShoppingBag", label: "Shopping" },
      { kind: "Pizza", label: "Pizza" },
      { kind: "Coins", label: "Coins" },
      { kind: "CreditCard", label: "Card" },
    ],
  },
  {
    label: "Trabajo y Ocio",
    icons: [
      { kind: "Briefcase", label: "Briefcase" },
      { kind: "TrendingUp", label: "Trending" },
      { kind: "Music", label: "Music" },
      { kind: "Book", label: "Book" },
      { kind: "Movie", label: "Movie" },
      { kind: "Camera", label: "Camera" },
    ],
  },
  {
    label: "Social y Tech",
    icons: [
      { kind: "Users", label: "Users" },
      { kind: "Dog", label: "Dog" },
      { kind: "Globe", label: "Globe" },
      { kind: "Map", label: "Map" },
      { kind: "DeviceMobile", label: "Mobile" },
      { kind: "DeviceLaptop", label: "Laptop" },
    ],
  },
];

const QUICK_ICONS: TablerGlyphKind[] = ["Home", "Car", "ToolsKitchen2", "CreditCard", "TrendingUp"];

export function CreateBlockModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [glyph, setGlyph]   = useState<TablerGlyphKind>("Home");
  const [name, setName]     = useState("");
  const [budget, setBudget] = useState("");
  const [goal, setGoal]     = useState("");
  const [saved, setSaved]   = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const { symbol, currency } = useCurrency();
  const createBlock = useCreateBlock();
  const num = useNumberInput({ value: budget, onChange: setBudget, currency, decimals: 0 });

  useEffect(() => {
    if (open) {
      setSaved(false);
      setName(""); setBudget(""); setGoal("");
      setGlyph("Home");
    }
  }, [open]);

  const canSave = name.trim().length > 0;

  const createFd = (n: string, i: string, b: number) => {
    const fd = new FormData();
    fd.set("name", n);
    fd.set("icon", i);
    fd.set("budget", String(b));
    return fd;
  };

  const save = () => {
    if (!canSave) return;
    const fd = createFd(name.trim(), glyph, num.numericValue || 0);
    if (goal.trim()) fd.set("goal", goal.trim());
    createBlock.mutate(fd, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(onClose, 500);
      },
    });
  };

  const selectQuickIcon = (kind: TablerGlyphKind) => {
    setGlyph(kind);
    setShowPicker(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
  };

  if (!open) return null;

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.40)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "10vh",
        animation: "gp-fade 220ms ease",
      }}
    >
      <div
        onMouseDown={e => e.stopPropagation()}
        onKeyDown={onKey}
        style={{
          width: 520, maxWidth: "92vw", maxHeight: "80vh",
          background: "var(--bg)", borderRadius: 16,
          boxShadow: "0 28px 80px rgba(0,0,0,0.32), 0 0 0 1px var(--hairline)",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          animation: "gp-rise 280ms cubic-bezier(.2,.85,.2,1)",
        }}
      >
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
                Bloque creado
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.14em" }}>
                {name}
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
              style={{ display: "flex", flexDirection: "column", maxHeight: "80vh", overflow: "hidden" }}
            >
              <div style={{ overflowY: "auto", flex: 1 }}>
                {/* Header */}
                <div style={{ padding: "18px 22px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                    Nuevo bloque
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <span className="kbd">esc</span>
                    <span className="kbd">⌘↵ guardar</span>
                  </div>
                </div>

                {/* Quick icons — 5 + 1 empty slot */}
                <div style={{ padding: "16px 22px 0" }}>
                  <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
                    Ícono
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {QUICK_ICONS.map(kind => (
                      <button
                        key={kind}
                        onClick={() => selectQuickIcon(kind)}
                        style={{
                          width: 44, height: 44, borderRadius: 10, border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: glyph === kind && !showPicker ? "var(--ink)" : "var(--surface)",
                          boxShadow: `inset 0 0 0 1px ${glyph === kind && !showPicker ? "transparent" : "var(--hairline)"}`,
                          transition: "all 140ms ease",
                        }}
                      >
                        <BlockGlyph kind={kind} size={18} color={glyph === kind && !showPicker ? "var(--inverse)" : "var(--ink)"} />
                      </button>
                    ))}
                    <button
                      onClick={() => setShowPicker(!showPicker)}
                      style={{
                        width: 44, height: 44, borderRadius: 10, border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: showPicker ? "var(--ink)" : "var(--surface)",
                        boxShadow: `inset 0 0 0 1px ${showPicker ? "transparent" : "var(--hairline)"}`,
                        transition: "all 140ms ease",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <line x1="8" y1="3" x2="8" y2="13" stroke={showPicker ? "var(--inverse)" : "var(--faint)"} strokeWidth="1.4" strokeLinecap="round"/>
                        <line x1="3" y1="8" x2="13" y2="8" stroke={showPicker ? "var(--inverse)" : "var(--faint)"} strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Collapsible full icon picker */}
                {showPicker && (
                  <div style={{ padding: "12px 22px 0" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {ICON_CATEGORIES.map(cat => (
                        <div key={cat.label}>
                          <div className="mono" style={{ fontSize: 8, color: "var(--mute)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
                            {cat.label}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
                            {cat.icons.map(ic => (
                              <button
                                key={ic.kind}
                                onClick={() => selectQuickIcon(ic.kind)}
                                style={{
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  padding: "6px 2px", borderRadius: 8, border: "none", cursor: "pointer",
                                  background: glyph === ic.kind ? "var(--ink)" : "var(--surface)",
                                  boxShadow: `inset 0 0 0 1px ${glyph === ic.kind ? "transparent" : "var(--hairline)"}`,
                                  transition: "all 140ms ease",
                                }}
                              >
                                <BlockGlyph kind={ic.kind} size={14} color={glyph === ic.kind ? "var(--inverse)" : "var(--ink)"} />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fields */}
                <div style={{ padding: "16px 22px 0", display: "grid", gap: 10 }}>
                  <div>
                    <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
                      Nombre
                    </div>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Casa, Viajes, Salud…"
                      autoFocus
                      style={{
                        width: "100%", padding: "9px 12px", borderRadius: 8,
                        background: "var(--surface)", border: "1px solid var(--hairline)",
                        outline: "none", fontFamily: "inherit", fontSize: 13,
                        color: "var(--ink)", letterSpacing: "-0.005em",
                        boxSizing: "border-box" as const,
                      }}
                    />
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
                      Techo mensual ({symbol}){" "}
                      <span style={{ opacity: 0.4, textTransform: "none", letterSpacing: 0 }}>Opcional</span>
                    </div>
                    <input
                      ref={num.ref}
                      value={num.display}
                      onChange={num.handleChange}
                      onBlur={num.handleBlur}
                      placeholder="0"
                      style={{
                        width: "100%", padding: "9px 12px", borderRadius: 8,
                        background: "var(--surface)", border: "1px solid var(--hairline)",
                        outline: "none", fontFamily: "'Inter Tight', inherit", fontSize: 13,
                        fontVariantNumeric: "tabular-nums", letterSpacing: "-0.005em",
                        color: "var(--ink)", boxSizing: "border-box" as const,
                      }}
                    />
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
                      Descripción{" "}
                      <span style={{ opacity: 0.4, textTransform: "none", letterSpacing: 0 }}>Opcional</span>
                    </div>
                    <input
                      value={goal}
                      onChange={e => setGoal(e.target.value)}
                      placeholder="Para viajes, reservas de emergencia…"
                      style={{
                        width: "100%", padding: "9px 12px", borderRadius: 8,
                        background: "var(--surface)", border: "1px solid var(--hairline)",
                        outline: "none", fontFamily: "inherit", fontSize: 13,
                        color: "var(--ink)", letterSpacing: "-0.005em",
                        boxSizing: "border-box" as const,
                      }}
                    />
                  </div>
                </div>

                {/* Error */}
                {createBlock.isError && (
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
                      {createBlock.error?.message || "Algo salió mal. Intentá de nuevo."}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Actions — sticky footer */}
              <div style={{
                padding: "18px 22px 22px", marginTop: 14,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderTop: "1px solid var(--hairline)",
                flexShrink: 0,
              }}>
                <button onClick={onClose} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, color: "var(--mute)", padding: 0,
                }}>
                  Cancelar
                </button>
                <motion.button
                  onClick={save}
                  disabled={!canSave || createBlock.isPending}
                  whileTap={canSave ? { scale: 0.96 } : {}}
                  style={{
                    padding: "11px 22px", borderRadius: 9,
                    background: canSave && !createBlock.isPending ? "var(--ink)" : "var(--surface)",
                    color: canSave && !createBlock.isPending ? "var(--inverse)" : "var(--faint)",
                    border: "none", fontFamily: "'Inter Tight', inherit",
                    fontSize: 13, fontWeight: 500, letterSpacing: "-0.005em",
                    cursor: canSave && !createBlock.isPending ? "pointer" : "default",
                    display: "flex", alignItems: "center", gap: 8,
                    transition: "background 200ms ease, color 200ms ease",
                  }}
                >
                  <span>Crear bloque</span>
                  <span className="kbd" style={{
                    background: "rgba(255,255,255,0.1)",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
                    color: "inherit",
                  }}>⌘↵</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
