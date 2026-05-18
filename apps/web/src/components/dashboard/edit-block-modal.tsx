"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useUpdateBlock } from "@/hooks/mutations";
import { useCurrency } from "@/hooks/use-currency";
import { useNumberInput } from "@/hooks/use-number-input";
import { BlockGlyph, type GlyphKind } from "@/components/ui/primitives";

const ALL_GLYPHS: { kind: GlyphKind; label: string }[] = [
  { kind: "Home",          label: "Casa"      },
  { kind: "Building",      label: "Edificio"  },
  { kind: "Key",           label: "Llaves"    },
  { kind: "Bulb",          label: "Luz"       },
  { kind: "Flame",         label: "Gas"       },
  { kind: "Droplet",       label: "Agua"      },
  { kind: "Car",           label: "Auto"      },
  { kind: "Bike",          label: "Bici"      },
  { kind: "Plane",         label: "Vuelos"    },
  { kind: "Train",         label: "Tren"      },
  { kind: "Bus",           label: "Micro"     },
  { kind: "GasStation",    label: "Nafta"     },
  { kind: "Heart",         label: "Salud"     },
  { kind: "Activity",      label: "Actividad" },
  { kind: "Barbell",       label: "Gym"       },
  { kind: "Apple",         label: "Dieta"     },
  { kind: "FirstAidKit",   label: "Médico"    },
  { kind: "Run",           label: "Deporte"   },
  { kind: "Coffee",        label: "Café"      },
  { kind: "ToolsKitchen2", label: "Cocina"    },
  { kind: "ShoppingBag",   label: "Compras"   },
  { kind: "Pizza",         label: "Comidas"   },
  { kind: "Coins",         label: "Efectivo"  },
  { kind: "CreditCard",    label: "Tarjeta"   },
  { kind: "Briefcase",     label: "Trabajo"   },
  { kind: "TrendingUp",    label: "Inversión" },
  { kind: "Music",         label: "Música"    },
  { kind: "Book",          label: "Libros"    },
  { kind: "Movie",         label: "Cine"      },
  { kind: "Camera",        label: "Fotos"     },
  { kind: "Users",         label: "Familia"   },
  { kind: "Dog",           label: "Mascota"   },
  { kind: "Globe",         label: "Mundial"   },
  { kind: "Map",           label: "Turismo"   },
  { kind: "DeviceMobile",  label: "Celular"   },
  { kind: "DeviceLaptop",  label: "Tech"      },
];

interface EditBlockModalProps {
  open: boolean;
  onClose: () => void;
  block: { id: string; name: string; icon: string; budget: number; goal: string };
}

export function EditBlockModal({ open, onClose, block }: EditBlockModalProps) {
  const [glyph, setGlyph]   = useState<GlyphKind>(block.icon as GlyphKind);
  const [name, setName]     = useState(block.name);
  const [budget, setBudget] = useState(String(block.budget));
  const [goal, setGoal]     = useState(block.goal);
  const [saved, setSaved]   = useState(false);
  const { symbol, currency } = useCurrency();
  const updateBlock = useUpdateBlock();
  const num = useNumberInput({ value: budget, onChange: setBudget, currency, decimals: 0 });

  useEffect(() => {
    if (open) {
      setSaved(false);
      setName(block.name);
      setBudget(block.budget > 0 ? String(block.budget) : "");
      setGoal(block.goal);
      setGlyph(block.icon as GlyphKind);
    }
  }, [open, block.name, block.budget, block.goal, block.icon]);

  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("icon", glyph);
    fd.set("budget", String(num.numericValue || 0));
    if (goal.trim()) fd.set("goal", goal.trim());
    updateBlock.mutate({ id: block.id, fd });
    setSaved(true);
    setTimeout(onClose, 500);
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
          width: 480, maxWidth: "92vw",
          background: "var(--bg)", borderRadius: 16,
          boxShadow: "0 28px 80px rgba(0,0,0,0.32), 0 0 0 1px var(--hairline)",
          overflow: "hidden",
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
                Bloque actualizado
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.14em" }}>
                {name}
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              {/* Header */}
              <div style={{ padding: "18px 22px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  Editar bloque
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <span className="kbd">esc</span>
                  <span className="kbd">⌘↵ guardar</span>
                </div>
              </div>

              {/* Glyph picker */}
              <div style={{ padding: "18px 22px 0" }}>
                <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
                  Ícono
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
                  {ALL_GLYPHS.map(g => (
                    <button
                      key={g.kind}
                      onClick={() => setGlyph(g.kind)}
                      title={g.label}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", gap: 5, padding: "10px 4px",
                        borderRadius: 8, border: "none", cursor: "pointer",
                        background: glyph === g.kind ? "var(--ink)" : "var(--surface)",
                        boxShadow: `inset 0 0 0 1px ${glyph === g.kind ? "transparent" : "var(--hairline)"}`,
                        transition: "all 140ms ease",
                      }}
                    >
                      <BlockGlyph
                        kind={g.kind}
                        size={16}
                        color={glyph === g.kind ? "var(--inverse)" : "var(--ink)"}
                      />
                      <span className="mono" style={{
                        fontSize: 8, letterSpacing: "0.04em",
                        color: glyph === g.kind ? "var(--inverse)" : "var(--faint)",
                        transition: "color 140ms ease",
                      }}>
                        {g.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

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

              {/* Actions */}
              <div style={{
                padding: "18px 22px 22px", marginTop: 14,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderTop: "1px solid var(--hairline)",
              }}>
                <button onClick={onClose} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, color: "var(--mute)", padding: 0,
                }}>
                  Cancelar
                </button>
                <motion.button
                  onClick={save}
                  disabled={!canSave || updateBlock.isPending}
                  whileTap={canSave ? { scale: 0.96 } : {}}
                  style={{
                    padding: "11px 22px", borderRadius: 9,
                    background: canSave && !updateBlock.isPending ? "var(--ink)" : "var(--surface)",
                    color: canSave && !updateBlock.isPending ? "var(--inverse)" : "var(--faint)",
                    border: "none", fontFamily: "'Inter Tight', inherit",
                    fontSize: 13, fontWeight: 500, letterSpacing: "-0.005em",
                    cursor: canSave && !updateBlock.isPending ? "pointer" : "default",
                    display: "flex", alignItems: "center", gap: 8,
                    transition: "background 200ms ease, color 200ms ease",
                  }}
                >
                  <span>Guardar cambios</span>
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
