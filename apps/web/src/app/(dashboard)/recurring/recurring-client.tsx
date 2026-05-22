"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRecurring } from "@/hooks/queries";
import { useCreateRecurring, usePayRecurring, useDeleteRecurring, usePauseRecurring, useUpdateRecurring } from "@/hooks/mutations";
import { Glyph, CATEGORY_GLYPH } from "@/components/ui/glyph";
import { Stat } from "@/components/ui/primitives";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { useCurrency } from "@/hooks/use-currency";
import { AmountInput } from "@/components/ui/amount-input";
import { parseNumeric } from "@/hooks/use-number-input";
import { springGentle } from "@/components/motion/presets";
import type { RecurringRow } from "@/hooks/queries";
import type { CustomCategory } from "@/lib/custom-categories";

// ── Category mapping ─────────────────────────────────────────────

const DEFAULT_CATS = ["Casa", "Salud", "Suscripciones", "Transporte", "Educación", "Tecnología", "Otros"];
const FREQS: { id: string; label: string }[] = [
  { id: "weekly",    label: "Semanal" },
  { id: "monthly",   label: "Mensual" },
  { id: "bimonthly", label: "Bimestral" },
  { id: "yearly",    label: "Anual" },
];

function groupKey(category: string): string {
  const c = category.toLowerCase().trim();
  if (c === "suscripciones" || c === "subs" || c === "subscripcion") return "Suscripciones";
  if (c === "casa" || c === "servicios" || c === "vivienda") return "Servicios";
  return "Otros";
}

const GROUP_ORDER = ["Suscripciones", "Servicios", "Otros"];

function countByGroup(items: RecurringRow[], group: string): number {
  return items.filter(i => !i.paused && groupKey(i.category) === group).length;
}

// ── Styles ────────────────────────────────────────────────────────

const fieldStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  background: "var(--surface)", border: "1px solid var(--hairline)",
  outline: "none", fontFamily: "inherit", fontSize: 13,
  color: "var(--ink)", letterSpacing: "-0.005em", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em",
  textTransform: "uppercase", marginBottom: 6,
};

// ── AddForm ───────────────────────────────────────────────────────

function AddForm({ onDone, categories }: { onDone: () => void; categories: string[] }) {
  const [freq, setFreq] = useState("monthly");
  const createRec = useCreateRecurring();

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createRec.mutate(fd, { onSuccess: () => onDone() });
  };

  return (
    <form onSubmit={save} style={{ padding: "20px 0", borderBottom: "1px solid var(--hairline)", display: "grid", gap: 12, width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) 80px", gap: 10 }}>
        <div>
          <div className="mono" style={labelStyle}>Nombre</div>
          <input name="name" required placeholder="Spotify, Alquiler…" style={fieldStyle} />
        </div>
        <div>
          <div className="mono" style={labelStyle}>Importe</div>
          <AmountInput name="amount" required placeholder="0" style={fieldStyle} />
        </div>
        <div>
          <div className="mono" style={labelStyle}>Frecuencia</div>
          <select name="frequency" value={freq} onChange={e => setFreq(e.target.value)} style={fieldStyle}>
            {FREQS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>
        <div>
          {freq === "monthly" ? (
            <>
              <div className="mono" style={labelStyle}>Día</div>
              <input
                name="dayOfMonth" type="number" min="1" max="31"
                placeholder="15" style={fieldStyle}
                title="Día fijo del mes en que se debita"
              />
            </>
          ) : (
            <div style={{ visibility: "hidden" }}>
              <div className="mono" style={labelStyle}>Día</div>
              <input disabled style={fieldStyle} />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "flex-end" }}>
        <div>
          <div className="mono" style={labelStyle}>Categoría</div>
          <select name="category" style={fieldStyle}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <div className="mono" style={labelStyle}>Nota</div>
          <input name="note" placeholder="Opcional" style={fieldStyle} />
        </div>
        {createRec.isError && (
          <div style={{
            padding: "9px 12px", borderRadius: 8,
            background: "rgba(0,0,0,0.05)",
            fontSize: 12, color: "var(--ink)",
            fontFamily: "inherit", letterSpacing: "-0.005em",
          }}>
            {createRec.error?.message || "Algo salió mal. Intentá de nuevo."}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={onDone} style={{
            padding: "9px 14px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "none", fontFamily: "inherit", fontSize: 12, color: "var(--mute)",
          }}>Cancelar</button>
          <button type="submit" disabled={createRec.isPending} style={{
            padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            background: createRec.isPending ? "var(--surface)" : "var(--ink)",
            color: createRec.isPending ? "var(--faint)" : "var(--inverse)",
            fontFamily: "inherit", fontSize: 12, fontWeight: 500,
          }}>
            Agregar
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Edit form for recurring ──────────────────────────────────────

function EditRecurringForm({
  item, onSave, onCancel, isPending, error, categories,
}: {
  item: RecurringRow;
  onSave: (data: { name: string; amount: number; category: string; frequency: string; dayOfMonth: number | null; note: string | null }) => void;
  onCancel: () => void;
  isPending: boolean;
  error?: string;
  categories: string[];
}) {
  const [name, setName] = useState(item.name);
  const [amount, setAmount] = useState(String(item.amount));
  const [category, setCategory] = useState(item.category);
  const [freq, setFreq] = useState(item.frequency);
  const [dayOfMonth, setDayOfMonth] = useState(item.dayOfMonth ? String(item.dayOfMonth) : "");
  const [note, setNote] = useState(item.note ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseNumeric(amount);
    if (!name.trim() || amt <= 0) return;
    onSave({
      name: name.trim(),
      amount: amt,
      category,
      frequency: freq,
      dayOfMonth: dayOfMonth ? parseInt(dayOfMonth) : null,
      note: note.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{
      padding: "16px 0", borderBottom: "1px solid var(--hairline)",
      display: "grid", gap: 10, width: "100%", minWidth: 0, boxSizing: "border-box",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) 80px", gap: 10 }}>
        <div>
          <div className="mono" style={labelStyle}>Nombre</div>
          <input value={name} onChange={e => setName(e.target.value)} required style={fieldStyle} />
        </div>
        <div>
          <div className="mono" style={labelStyle}>Importe</div>
          <AmountInput value={amount} onChange={setAmount} required style={fieldStyle} />
        </div>
        <div>
          <div className="mono" style={labelStyle}>Frecuencia</div>
          <select value={freq} onChange={e => setFreq(e.target.value as typeof item.frequency)} style={fieldStyle}>
            {FREQS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>
        <div>
          {freq === "monthly" ? (
            <>
              <div className="mono" style={labelStyle}>Día</div>
              <input type="number" min="1" max="31" value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} placeholder="15" style={fieldStyle} />
            </>
          ) : (
            <div style={{ visibility: "hidden" }}>
              <div className="mono" style={labelStyle}>Día</div>
              <input disabled style={fieldStyle} />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div className="mono" style={labelStyle}>Categoría</div>
          <select value={category} onChange={e => setCategory(e.target.value)} style={fieldStyle}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <div className="mono" style={labelStyle}>Nota</div>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Opcional" style={fieldStyle} />
        </div>
      </div>

      {error && (
        <div style={{
          padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.05)",
          fontSize: 12, color: "var(--ink)", fontFamily: "inherit",
        }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={onCancel} style={{
          padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
          background: "none", fontFamily: "inherit", fontSize: 12, color: "var(--mute)",
        }}>Cancelar</button>
        <button type="submit" disabled={isPending} style={{
          padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
          background: isPending ? "var(--surface)" : "var(--ink)",
          color: isPending ? "var(--faint)" : "var(--inverse)",
          fontFamily: "inherit", fontSize: 12, fontWeight: 500,
        }}>Guardar</button>
      </div>
    </form>
  );
}

// ── Single row ───────────────────────────────────────────────────

function RecurringRowItem({ item, categories }: { item: RecurringRow; categories: string[] }) {
  const { format } = useCurrency();
  const pay = usePayRecurring();
  const del = useDeleteRecurring();
  const pause = usePauseRecurring();
  const upd = useUpdateRecurring();
  const [editing, setEditing] = useState(false);

  const freqLabel = FREQS.find(f => f.id === item.frequency)?.label ?? item.frequency;
  const daysUntil = Math.ceil((item.nextDueDateMs - Date.now()) / (1000 * 60 * 60 * 24));
  const urgent = !item.paused && !item.paidThisPeriod && daysUntil <= 5;
  const isOpt = item.id.startsWith("opt-");
  const showPaid = item.paidThisPeriod && !item.paused;

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {editing ? (
        <motion.div
          key="edit-form"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{ overflow: "hidden", width: "100%", minWidth: 0, maxWidth: "100%" }}
        >
          <EditRecurringForm
            item={item}
            categories={categories}
            onSave={(data) => {
              upd.mutate(
                { id: item.id, data },
                { onSuccess: () => setEditing(false) },
              );
            }}
            onCancel={() => setEditing(false)}
            isPending={upd.isPending}
            error={upd.error?.message}
          />
        </motion.div>
      ) : (
        <motion.div
          key="row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="row-hover" style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 0", borderBottom: "1px solid var(--hairline)",
            opacity: isOpt || item.paused ? 0.45 : 1,
            transition: "opacity 200ms",
          }}>
            <div style={{ width: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Glyph kind={CATEGORY_GLYPH[item.category] ?? "Home"} size={14} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em" }}>{item.name}</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 3 }}>
                {item.category} ·{" "}
                {showPaid ? (
                  <span style={{ color: "var(--ink)" }}>Pagado</span>
                ) : (
                  <>próx {item.nextDueDate}</>
                )}
              </div>
            </div>

            <div className="mono" style={{
              fontSize: 11, letterSpacing: "0.04em",
              color: urgent ? "var(--ink)" : "var(--faint)",
              fontWeight: urgent ? 500 : 400,
              flexShrink: 0,
            }}>
              {item.paused ? "Pausado" : showPaid ? "Pagado" : daysUntil <= 0 ? "Hoy" : daysUntil === 1 ? "Mañana" : item.nextDueDate}
            </div>

            <div className="display tnum" style={{
              fontSize: 15, fontWeight: 500, color: "var(--ink)",
              letterSpacing: "-0.025em", flexShrink: 0, minWidth: 80, textAlign: "right",
            }}>
              {format(item.amount)}
            </div>

            {!item.paused && (
              <button
                onClick={() => !isOpt && pay.mutate(item.id)}
                disabled={isOpt || pay.isPending}
                title="Marcar como pagado"
                style={{
                  padding: "4px 8px", background: "none", border: "none",
                  cursor: isOpt || pay.isPending ? "default" : "pointer",
                  fontFamily: "inherit", fontSize: 10, letterSpacing: "0.04em",
                  color: "var(--mute)", flexShrink: 0,
                  borderBottom: "1px solid transparent",
                }}>
                Pagar
              </button>
            )}

            <button
              onClick={() => !isOpt && setEditing(true)}
              disabled={isOpt}
              title="Editar"
              style={{
                padding: "4px 8px", background: "none", border: "none",
                cursor: isOpt ? "default" : "pointer",
                fontFamily: "inherit", fontSize: 10, letterSpacing: "0.04em",
                color: "var(--mute)", flexShrink: 0,
              }}>
              Editar
            </button>

            <button
              onClick={() => !isOpt && pause.mutate(item.id)}
              disabled={isOpt || pause.isPending}
              title={item.paused ? "Reanudar" : "Pausar"}
              style={{
                padding: "4px 8px", background: "none", border: "none",
                cursor: isOpt || pause.isPending ? "default" : "pointer",
                fontFamily: "inherit", fontSize: 10, letterSpacing: "0.04em",
                color: "var(--mute)", flexShrink: 0,
                borderBottom: "1px solid transparent",
              }}>
              {item.paused ? "Reanudar" : "Pausar"}
            </button>

            <button
              onClick={() => !isOpt && del.mutate(item.id)}
              disabled={isOpt || del.isPending}
              title="Eliminar"
              style={{
                padding: "4px 8px", background: "none", border: "none",
                cursor: isOpt || del.isPending ? "default" : "pointer",
                fontFamily: "inherit", fontSize: 10, letterSpacing: "0.04em",
                color: "var(--mute)", flexShrink: 0,
              }}>
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Group section ────────────────────────────────────────────────

function GroupSection({ title, items, categories }: { title: string; items: RecurringRow[]; categories: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        paddingTop: 20, paddingBottom: 2,
      }}>
        <div style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-mono, monospace)", fontWeight: 500 }}>
          {title}
        </div>
        <div style={{
          height: 1, flex: 1, background: "var(--hairline)",
        }} />
      </div>
      {items.map(item => <RecurringRowItem key={item.id} item={item} categories={categories} />)}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────

export function RecurringClient({ initialItems, customCategories }: { initialItems: RecurringRow[]; customCategories?: CustomCategory[] }) {
  const [adding, setAdding] = useState(false);
  const { data: items } = useRecurring(initialItems);
  const { format } = useCurrency();

  const list = items ?? [];
  const expenseCats = customCategories
    ? customCategories.filter(c => c.type === "expense").map(c => c.label)
    : DEFAULT_CATS;

  // Compute metrics
  const activeItems = useMemo(() => list.filter(i => !i.paused), [list]);
  const totalMonthly = useMemo(() =>
    activeItems.reduce((s, i) => {
      const mult = i.frequency === "weekly" ? 4.3 : i.frequency === "bimonthly" ? 0.5 : i.frequency === "yearly" ? 1 / 12 : 1;
      return s + i.amount * mult;
    }, 0),
  [activeItems]);
  const subsCount = useMemo(() => countByGroup(list, "Suscripciones"), [list]);
  const servicesCount = useMemo(() => countByGroup(list, "Servicios"), [list]);

  // Group items
  const groups = useMemo(() => {
    const acc: Record<string, RecurringRow[]> = { Suscripciones: [], Servicios: [], Otros: [] };
    for (const item of list) {
      const g = groupKey(item.category);
      acc[g].push(item);
    }
    return acc;
  }, [list]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px 80px" }}>
      {/* Title row */}
      <header style={{ paddingBottom: 20, borderBottom: "1px solid var(--hairline)" }}>
        <motion.div
          className="mono"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.05 }}
          style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}
        >
          Recurrentes
        </motion.div>
        <motion.h1
          className="display"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.1 }}
          style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em", color: "var(--ink)", lineHeight: 1 }}
        >
          Recurrentes
        </motion.h1>
      </header>

      {/* Metrics row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        paddingTop: 24, paddingBottom: 8,
      }}>
        <Stat value={Math.round(totalMonthly)} label="Por mes" prefix="$" decimals={0} />
        <Stat value={subsCount} label="Suscripciones" decimals={0} />
        <Stat value={servicesCount} label="Servicios" decimals={0} />
      </div>

      {/* Add button / form */}
      <div style={{ marginTop: 16 }}>
        {adding && <AddForm onDone={() => setAdding(false)} categories={expenseCats} />}

        {!adding && (
          <button onClick={() => setAdding(true)} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "14px 0", background: "none", border: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: 13, color: "var(--mute)",
            borderBottom: "1px solid var(--hairline)", width: "100%", textAlign: "left",
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12">
              <line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Agregar gasto recurrente
          </button>
        )}
      </div>

      {/* Empty state */}
      {list.length === 0 && !adding ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "80px 0", gap: 16,
        }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.06em", textAlign: "center" }}>
            Sin gastos recurrentes. Registrá alquiler, suscripciones o servicios.
          </div>
        </div>
      ) : (
        /* Grouped list */
        <>
          {GROUP_ORDER.map(g => (
            <GroupSection key={g} title={g} items={groups[g]} categories={expenseCats} />
          ))}
        </>
      )}
    </div>
  );
}
