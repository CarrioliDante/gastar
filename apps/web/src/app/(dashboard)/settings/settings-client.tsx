"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/components/providers/theme-provider";
import { useUIStore } from "@/stores/ui";
import { logout } from "@/app/(auth)/actions";
import { springGentle } from "@/components/motion/presets";
import { setMonthlyBudget, updateUserName, updateCustomCategories, resetUserData } from "@/app/actions/settings";
import { useNumberInput } from "@/hooks/use-number-input";
import { BlockGlyph, type GlyphKind } from "@/components/ui/primitives";
import { qk } from "@/hooks/query-keys";
import type { CustomCategory } from "@/lib/custom-categories";
import { CsvImporter } from "@/components/dashboard/csv-importer";

const GLYPHS: GlyphKind[] = [
  "Home", "Building", "Key", "Bulb", "Flame", "Droplet",
  "Car", "Bike", "Plane", "Train", "Bus", "GasStation",
  "Heart", "Activity", "Barbell", "Apple", "FirstAidKit", "Run",
  "Coffee", "ToolsKitchen2", "ShoppingBag", "Pizza", "Coins", "CreditCard",
  "Briefcase", "TrendingUp", "Music", "Book", "Movie", "Camera",
  "Users", "Dog", "Globe", "Map", "DeviceMobile", "DeviceLaptop",
];

const ROW_MIN_HEIGHT = 38;

function GlyphPicker({ value, onChange }: { value: GlyphKind; onChange: (g: GlyphKind) => void }) {
  return (
    <div style={{ display: "flex", gap: 4, overflow: "auto", maxWidth: 240, paddingBottom: 4 }}>
      {GLYPHS.map((g) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          title={g}
          style={{
            width: 28, height: 28, borderRadius: 6, padding: 0, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: value === g ? "var(--ink)" : "var(--surface)",
            border: `1px solid ${value === g ? "var(--ink)" : "var(--hairline)"}`,
            cursor: "pointer",
          }}
        >
          <BlockGlyph kind={g} size={14} color={value === g ? "var(--inverse)" : "var(--ink)"} />
        </button>
      ))}
    </div>
  );
}

const DEFAULTS: CustomCategory[] = [
  { id: "comida", label: "Comida", glyph: "Coffee", type: "expense" },
  { id: "servicios", label: "Servicios", glyph: "Droplet", type: "expense" },
  { id: "casa", label: "Casa", glyph: "Home", type: "expense" },
  { id: "transporte", label: "Transporte", glyph: "Car", type: "expense" },
  { id: "ocio", label: "Ocio", glyph: "Music", type: "expense" },
  { id: "subs", label: "Suscripciones", glyph: "CreditCard", type: "expense" },
  { id: "salud", label: "Salud", glyph: "Heart", type: "expense" },
  { id: "salario", label: "Salario", glyph: "Coins", type: "income" },
  { id: "freelance", label: "Freelance", glyph: "Briefcase", type: "income" },
  { id: "devolucion", label: "Devolución", glyph: "Coins", type: "income" },
  { id: "inversion", label: "Inversión", glyph: "TrendingUp", type: "income" },
  { id: "regalo", label: "Regalo", glyph: "Heart", type: "income" },
  { id: "otros", label: "Otros", glyph: "Globe", type: "income" },
];

type Row = { label: string; value: React.ReactNode };

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div style={{ marginTop: 40 }}>
      <div className="mono" style={{
        fontSize: 9, color: "var(--faint)", letterSpacing: "0.18em",
        textTransform: "uppercase", marginBottom: 12,
      }}>{title}</div>
      <div style={{ borderTop: "1px solid var(--hairline)" }}>
        {rows.map((row, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 0", borderBottom: "1px solid var(--hairline)",
            gap: 24,
          }}>
            <span style={{ fontSize: 13, color: "var(--ink)", letterSpacing: "-0.005em" }}>{row.label}</span>
            <div style={{ flexShrink: 0 }}>{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 40, height: 22, borderRadius: 99, padding: 2,
      background: value ? "var(--ink)" : "var(--hairline2)",
      border: "none", cursor: "pointer", position: "relative",
      transition: "background 240ms ease",
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 99,
        background: value ? "var(--inverse)" : "var(--surface)",
        position: "absolute", top: 2,
        left: value ? "calc(100% - 20px)" : 2,
        transition: "left 240ms cubic-bezier(.2,.85,.2,1)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

function FontPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = [
    { id: "sans",  label: "Sans" },
    { id: "serif", label: "Serif" },
    { id: "mono",  label: "Mono" },
  ];
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {opts.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          padding: "6px 0", background: "none", border: "none", cursor: "pointer",
          fontFamily: "inherit", fontSize: 12, letterSpacing: "-0.005em",
          color: value === o.id ? "var(--ink)" : "var(--faint)",
          borderBottom: value === o.id ? "1px solid var(--ink)" : "1px solid transparent",
          fontWeight: value === o.id ? 500 : 400,
          transition: "all 160ms ease",
        }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

const CURRENCIES = [
  { id: "USD", label: "USD $" },
  { id: "ARS", label: "ARS $" },
  { id: "BRL", label: "BRL R$" },
  { id: "EUR", label: "EUR €" },
];

function CurrencyPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {CURRENCIES.map(c => (
        <button key={c.id} onClick={() => onChange(c.id)} style={{
          padding: "6px 0", background: "none", border: "none", cursor: "pointer",
          fontFamily: "inherit", fontSize: 12, letterSpacing: "-0.005em",
          color: value === c.id ? "var(--ink)" : "var(--faint)",
          borderBottom: value === c.id ? "1px solid var(--ink)" : "1px solid transparent",
          fontWeight: value === c.id ? 500 : 400,
          transition: "all 160ms ease",
        }}>
          {c.label}
        </button>
      ))}
    </div>
  );
}

export function SettingsClient({ email, name, monthlyBudget: initialBudget, customCategories: initialCats }: {
  email: string; name: string; monthlyBudget: number;
  customCategories: { expenses: CustomCategory[]; incomes: CustomCategory[] };
}) {
  const router = useRouter();
  const { theme, font, currency, setTheme, setFont, setCurrency } = useTheme();
  const animationsEnabled = useUIStore((s) => s.animationsEnabled);
  const setAnimationsEnabled = useUIStore((s) => s.setAnimationsEnabled);
  const [saving, setSaving] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [budgetValue, setBudgetValue] = useState(String(initialBudget));
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [categories, setCategories] = useState<CustomCategory[]>(() => [
    ...initialCats.expenses, ...initialCats.incomes,
  ]);
  const qc = useQueryClient();
  const [savingCats, setSavingCats] = useState(false);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [catEditLabel, setCatEditLabel] = useState("");
  const [catEditGlyph, setCatEditGlyph] = useState<GlyphKind>("Home");
  const [addingType, setAddingType] = useState<"expense" | "income" | null>(null);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatGlyph, setNewCatGlyph] = useState<GlyphKind>("Home");

  const displayName = nameValue || email.split("@")[0] || "Usuario";
  const initials = displayName.slice(0, 2).toUpperCase();

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    setSavingName(true);
    try {
      await updateUserName(nameValue);
      setEditingName(false);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setSavingName(false);
    }
  };

  const budgetInput = useNumberInput({
    value: budgetValue,
    onChange: setBudgetValue,
    currency,
    decimals: 0,
  });

  const saveBudget = async () => {
    const val = parseInt(budgetInput.raw, 10);
    if (!val || val <= 0) return;
    setSaving(true);
    const fd = new FormData();
    fd.set("budget", String(val));
    await setMonthlyBudget(fd);
    setSaving(false);
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetUserData();
      qc.clear();
      router.push("/");
    } finally {
      setResetting(false);
      setResetConfirm(false);
    }
  };

  const startCatEdit = (cat: CustomCategory) => {
    setEditingCat(cat.id);
    setCatEditLabel(cat.label);
    setCatEditGlyph(cat.glyph as GlyphKind);
  };

  const commitCatEdit = () => {
    if (!editingCat) return;
    setCategories(prev => prev.map(c =>
      c.id === editingCat ? { ...c, label: catEditLabel || c.label, glyph: catEditGlyph } : c,
    ));
    setEditingCat(null);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const startNewCat = (type: "expense" | "income") => {
    setAddingType(type);
    setNewCatLabel("");
    setNewCatGlyph("Home");
  };

  const commitNewCat = () => {
    if (!addingType || !newCatLabel.trim()) return;
    const id = newCatLabel.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setCategories(prev => [...prev, {
      id: id || `cat-${Date.now()}`,
      label: newCatLabel.trim(),
      glyph: newCatGlyph,
      type: addingType,
    }]);
    setAddingType(null);
  };

  const resetCategories = () => {
    // Reset confirm is implicit
    setCategories(DEFAULTS);
  };

  const saveCategoriesAction = async () => {
    setSavingCats(true);
    try {
      await updateCustomCategories(categories);
      qc.invalidateQueries({ queryKey: qk.categories });
    } finally {
      setSavingCats(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 40px 120px" }}>
      <header style={{ paddingBottom: 28, borderBottom: "1px solid var(--hairline)" }}>
        <motion.div
          className="mono"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.05 }}
          style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}
        >
          Preferencias
        </motion.div>
        <motion.h1
          className="display"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.1 }}
          style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em", color: "var(--ink)", lineHeight: 1 }}
        >
          Ajustes
        </motion.h1>
      </header>

      {/* User avatar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.3 }}
        style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 16 }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: "var(--ink)", color: "var(--inverse)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Inter Tight', inherit", fontWeight: 600, fontSize: 18,
          flexShrink: 0,
        }}>{initials}</div>

        <div style={{ flex: 1 }}>
          {editingName ? (
            <form onSubmit={saveName} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                autoFocus
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                style={{
                  padding: "6px 10px", borderRadius: 7, border: "1px solid var(--hairline)",
                  background: "var(--surface)", fontFamily: "inherit", fontSize: 14,
                  fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.01em",
                  outline: "none", width: 200,
                }}
              />
              <button type="submit" disabled={savingName} style={{
                padding: "6px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                background: savingName ? "var(--surface)" : "var(--ink)",
                color: savingName ? "var(--faint)" : "var(--inverse)",
                fontFamily: "inherit", fontSize: 12, fontWeight: 500,
              }}>
                {savingName ? "…" : "Guardar"}
              </button>
              <button type="button" onClick={() => { setEditingName(false); setNameValue(name); setNameError(null); }} style={{
                padding: "6px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                background: "none", fontFamily: "inherit", fontSize: 12, color: "var(--mute)",
              }}>
                Cancelar
              </button>
              {nameError && (
                <span style={{ fontSize: 11, color: "var(--ink)", fontFamily: "inherit" }}>{nameError}</span>
              )}
            </form>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.01em" }}>{displayName}</div>
              <button onClick={() => setEditingName(true)} style={{
                padding: "3px 8px", background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 10, color: "var(--mute)",
                letterSpacing: "0.02em",
              }}>
                Editar
              </button>
            </div>
          )}
          <div className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 3 }}>{email}</div>
        </div>
      </motion.div>

      <Section title="Finanzas" rows={[
        {
          label: "Presupuesto mensual",
          value: (
            <form
              onSubmit={e => { e.preventDefault(); saveBudget(); }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <span style={{ color: "var(--faint)", fontSize: 14 }}>$</span>
              <input
                ref={budgetInput.ref}
                value={budgetInput.display}
                onChange={budgetInput.handleChange}
                onBlur={budgetInput.handleBlur}
                placeholder="5.000"
                style={{
                  width: 120, padding: "8px 12px", borderRadius: 8,
                  background: "var(--surface)", border: "1px solid var(--hairline)",
                  outline: "none", fontFamily: "'Inter Tight', sans-serif",
                  fontSize: 14, fontWeight: 500, color: "var(--ink)",
                  letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums",
                  textAlign: "right",
                }}
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.96 }}
                disabled={saving || parseInt(budgetInput.raw, 10) === initialBudget}
                style={{
                  padding: "8px 14px", borderRadius: 7, border: "none", cursor: "pointer",
                  background: (saving || parseInt(budgetInput.raw, 10) === initialBudget) ? "var(--surface)" : "var(--ink)",
                  color: (saving || parseInt(budgetInput.raw, 10) === initialBudget) ? "var(--faint)" : "var(--inverse)",
                  fontFamily: "inherit", fontSize: 12, fontWeight: 500,
                  letterSpacing: "-0.005em", whiteSpace: "nowrap",
                }}
              >
                {saving ? "..." : "Guardar"}
              </motion.button>
            </form>
          ),
        },
      ]} />

      <Section title="Apariencia" rows={[
        {
          label: "Modo noche",
          value: <Toggle value={theme === "dark"} onChange={v => setTheme(v ? "dark" : "light")} />,
        },
        {
          label: "Tipografía",
          value: <FontPicker value={font} onChange={f => setFont(f as "sans" | "serif" | "mono")} />,
        },
        {
          label: "Animaciones",
          value: <Toggle value={animationsEnabled} onChange={setAnimationsEnabled} />,
        },
        {
          label: "Moneda",
          value: <CurrencyPicker value={currency} onChange={c => setCurrency(c as "USD" | "ARS" | "BRL" | "EUR")} />,
        },
      ]} />

      {/* Categorías personalizadas */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.25 }}
        style={{ marginTop: 40 }}
      >
        <div className="mono" style={{
          fontSize: 9, color: "var(--faint)", letterSpacing: "0.18em",
          textTransform: "uppercase", marginBottom: 12,
        }}>Categorías personalizadas</div>
        <div style={{ borderTop: "1px solid var(--hairline)" }}>
          {/* Expenses */}
          <div style={{
            padding: "14px 0 6px", fontSize: 10, color: "var(--faint)",
            letterSpacing: "0.10em", textTransform: "uppercase",
            fontFamily: "'Inter Tight', sans-serif", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span>Gastos</span>
            <button onClick={() => startNewCat("expense")} style={{
              padding: "2px 8px", background: "none", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: 10, color: "var(--mute)",
            }}>
              + Agregar
            </button>
          </div>
          {addingType === "expense" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--hairline)" }}>
              <GlyphPicker value={newCatGlyph} onChange={setNewCatGlyph} />
              <input
                autoFocus
                value={newCatLabel}
                onChange={e => setNewCatLabel(e.target.value)}
                placeholder="Nueva categoría"
                style={{
                  flex: 1, padding: "6px 8px", borderRadius: 6,
                  border: "1px solid var(--hairline)", background: "var(--surface)",
                  fontFamily: "inherit", fontSize: 13, color: "var(--ink)", outline: "none",
                }}
              />
              <button onClick={commitNewCat} style={{
                padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                background: "var(--ink)", color: "var(--inverse)",
                fontFamily: "inherit", fontSize: 11, fontWeight: 500,
              }}>OK</button>
              <button onClick={() => setAddingType(null)} style={{
                padding: "5px 8px", borderRadius: 6, border: "none", cursor: "pointer",
                background: "none", fontFamily: "inherit", fontSize: 11, color: "var(--mute)",
              }}>×</button>
            </div>
          )}
          {categories.filter(c => c.type === "expense").map(cat => (
            <div key={cat.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 0", borderBottom: "1px solid var(--hairline)",
              minHeight: ROW_MIN_HEIGHT,
            }}>
              {editingCat === cat.id ? (
                <>
                  <GlyphPicker value={catEditGlyph} onChange={setCatEditGlyph} />
                  <input
                    autoFocus
                    value={catEditLabel}
                    onChange={e => setCatEditLabel(e.target.value)}
                    style={{
                      flex: 1, padding: "6px 8px", borderRadius: 6,
                      border: "1px solid var(--hairline)", background: "var(--surface)",
                      fontFamily: "inherit", fontSize: 13, color: "var(--ink)", outline: "none",
                    }}
                  />
                  <button onClick={commitCatEdit} style={{
                    padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                    background: "var(--ink)", color: "var(--inverse)",
                    fontFamily: "inherit", fontSize: 11, fontWeight: 500,
                  }}>OK</button>
                  <button onClick={() => setEditingCat(null)} style={{
                    padding: "5px 8px", borderRadius: 6, border: "none", cursor: "pointer",
                    background: "none", fontFamily: "inherit", fontSize: 11, color: "var(--mute)",
                  }}>×</button>
                </>
              ) : (
                <>
                  <BlockGlyph kind={cat.glyph as GlyphKind} size={14} />
                  <span style={{ flex: 1, fontSize: 13, color: "var(--ink)", letterSpacing: "-0.005em" }}>
                    {cat.label}
                  </span>
                  <button onClick={() => startCatEdit(cat)} style={{
                    padding: "3px 8px", background: "none", border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 10, color: "var(--mute)",
                  }}>
                    Editar
                  </button>
                  <button onClick={() => deleteCategory(cat.id)} style={{
                    padding: "3px 6px", background: "none", border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 10, color: "var(--faint)",
                  }}>
                    ×
                  </button>
                </>
              )}
            </div>
          ))}

          {/* Incomes */}
          <div style={{
            padding: "14px 0 6px", fontSize: 10, color: "var(--faint)",
            letterSpacing: "0.10em", textTransform: "uppercase",
            fontFamily: "'Inter Tight', sans-serif", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span>Ingresos</span>
            <button onClick={() => startNewCat("income")} style={{
              padding: "2px 8px", background: "none", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: 10, color: "var(--mute)",
            }}>
              + Agregar
            </button>
          </div>
          {addingType === "income" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--hairline)" }}>
              <GlyphPicker value={newCatGlyph} onChange={setNewCatGlyph} />
              <input
                autoFocus
                value={newCatLabel}
                onChange={e => setNewCatLabel(e.target.value)}
                placeholder="Nueva categoría"
                style={{
                  flex: 1, padding: "6px 8px", borderRadius: 6,
                  border: "1px solid var(--hairline)", background: "var(--surface)",
                  fontFamily: "inherit", fontSize: 13, color: "var(--ink)", outline: "none",
                }}
              />
              <button onClick={commitNewCat} style={{
                padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                background: "var(--ink)", color: "var(--inverse)",
                fontFamily: "inherit", fontSize: 11, fontWeight: 500,
              }}>OK</button>
              <button onClick={() => setAddingType(null)} style={{
                padding: "5px 8px", borderRadius: 6, border: "none", cursor: "pointer",
                background: "none", fontFamily: "inherit", fontSize: 11, color: "var(--mute)",
              }}>×</button>
            </div>
          )}
          {categories.filter(c => c.type === "income").map(cat => (
            <div key={cat.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 0", borderBottom: "1px solid var(--hairline)",
              minHeight: ROW_MIN_HEIGHT,
            }}>
              {editingCat === cat.id ? (
                <>
                  <GlyphPicker value={catEditGlyph} onChange={setCatEditGlyph} />
                  <input
                    autoFocus
                    value={catEditLabel}
                    onChange={e => setCatEditLabel(e.target.value)}
                    style={{
                      flex: 1, padding: "6px 8px", borderRadius: 6,
                      border: "1px solid var(--hairline)", background: "var(--surface)",
                      fontFamily: "inherit", fontSize: 13, color: "var(--ink)", outline: "none",
                    }}
                  />
                  <button onClick={commitCatEdit} style={{
                    padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                    background: "var(--ink)", color: "var(--inverse)",
                    fontFamily: "inherit", fontSize: 11, fontWeight: 500,
                  }}>OK</button>
                  <button onClick={() => setEditingCat(null)} style={{
                    padding: "5px 8px", borderRadius: 6, border: "none", cursor: "pointer",
                    background: "none", fontFamily: "inherit", fontSize: 11, color: "var(--mute)",
                  }}>×</button>
                </>
              ) : (
                <>
                  <BlockGlyph kind={cat.glyph as GlyphKind} size={14} />
                  <span style={{ flex: 1, fontSize: 13, color: "var(--ink)", letterSpacing: "-0.005em" }}>
                    {cat.label}
                  </span>
                  <button onClick={() => startCatEdit(cat)} style={{
                    padding: "3px 8px", background: "none", border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 10, color: "var(--mute)",
                  }}>
                    Editar
                  </button>
                  <button onClick={() => deleteCategory(cat.id)} style={{
                    padding: "3px 6px", background: "none", border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 10, color: "var(--faint)",
                  }}>
                    ×
                  </button>
                </>
              )}
            </div>
          ))}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, paddingTop: 14, paddingBottom: 4 }}>
            <button onClick={saveCategoriesAction} disabled={savingCats} style={{
              padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer",
              background: savingCats ? "var(--surface)" : "var(--ink)",
              color: savingCats ? "var(--faint)" : "var(--inverse)",
              fontFamily: "inherit", fontSize: 12, fontWeight: 500,
            }}>
              {savingCats ? "..." : "Guardar cambios"}
            </button>
            <button onClick={resetCategories} style={{
              padding: "7px 14px", background: "none", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: 12, color: "var(--mute)",
              borderBottom: "1px solid transparent",
            }}>
              Restaurar defaults
            </button>
          </div>
        </div>
      </motion.div>

      <Section title="Cuenta" rows={[
        {
          label: "Email",
          value: <span className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.04em" }}>{email}</span>,
        },
        {
          label: "Plan",
          value: <span className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.04em" }}>Personal · Gratuito</span>,
        },
      ]} />

      <Section title="Datos" rows={[
        {
          label: "Exportar transacciones",
          value: (
            <a href="/api/export" download style={{
              padding: "7px 0", background: "none", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: 12, color: "var(--mute)",
              letterSpacing: "-0.005em", textDecoration: "none",
              borderBottom: "1px solid transparent",
            }}>
              Exportar CSV
            </a>
          ),
        },
      ]} />

      {/* Importar CSV — full-width below the section */}
      <div style={{ marginTop: 0 }}>
        <div style={{ padding: "16px 0", borderBottom: "1px solid var(--hairline)" }}>
          <span style={{ fontSize: 13, color: "var(--ink)", letterSpacing: "-0.005em" }}>
            Importar extracto bancario
          </span>
          <CsvImporter categories={categories} />
        </div>
      </div>

      {/* Reset data row — outside Section to allow full-width confirm state */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 0", borderBottom: "1px solid var(--hairline)", gap: 16,
      }}>
        <span style={{ fontSize: 13, color: "var(--ink)", letterSpacing: "-0.005em", flexShrink: 0 }}>
          Reiniciar datos
        </span>
        {resetConfirm ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, justifyContent: "flex-end" }}>
            <span style={{ fontSize: 11, color: "var(--mute)", letterSpacing: "-0.005em" }}>
              Borrás todos los datos financieros. No se puede deshacer.
            </span>
            <button
              onClick={handleReset}
              disabled={resetting}
              style={{
                padding: "6px 12px", borderRadius: 7, border: "1px solid var(--hairline)",
                cursor: resetting ? "default" : "pointer",
                background: "none", fontFamily: "inherit", fontSize: 12,
                color: resetting ? "var(--faint)" : "var(--ink)",
                fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              {resetting ? "Eliminando…" : "Confirmar"}
            </button>
            <button
              onClick={() => setResetConfirm(false)}
              disabled={resetting}
              style={{
                padding: "6px 0", background: "none", border: "none",
                cursor: "pointer", fontFamily: "inherit", fontSize: 12,
                color: "var(--faint)", flexShrink: 0,
              }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setResetConfirm(true)}
            style={{
              padding: "7px 0", background: "none", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: 12, color: "var(--mute)",
              letterSpacing: "-0.005em",
            }}
          >
            Borrar todos los datos
          </button>
        )}
      </div>

      <Section title="Sesión" rows={[
        {
          label: "Cerrar sesión",
          value: (
            <form action={logout}>
              <button type="submit" style={{
                padding: "7px 0", background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 12, color: "var(--mute)",
                letterSpacing: "-0.005em",
              }}>
                Salir de la cuenta
              </button>
            </form>
          ),
        },
      ]} />
    </div>
  );
}
