"use client";

import { useState, useTransition, useOptimistic } from "react";
import { Glyph, CATEGORY_GLYPH } from "@/components/ui/glyph";
import { createRecurring, markRecurringPaid, deleteRecurring } from "@/app/actions/recurring";
import type { RecurringRow } from "@/lib/queries/recurring";

const CATS = ["Casa", "Salud", "Suscripciones", "Transporte", "Educación", "Tecnología", "Otros"];
const FREQS: { id: string; label: string }[] = [
  { id: "weekly",    label: "Semanal" },
  { id: "monthly",   label: "Mensual" },
  { id: "bimonthly", label: "Bimestral" },
  { id: "yearly",    label: "Anual" },
];
const FREQ_DAYS: Record<string, number> = { weekly: 7, monthly: 30, bimonthly: 60, yearly: 365 };

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

// Mirror server-side logic for client-side optimistic date computation
function computeNextDue(frequency: string, dayOfMonth: number | null) {
  if (dayOfMonth && frequency === "monthly") {
    const now = new Date();
    let d = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
    if (d <= now) d = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
    return { ms: d.getTime(), display: d.toLocaleDateString("es-AR", { day: "numeric", month: "short" }) };
  }
  const d = new Date();
  d.setDate(d.getDate() + (FREQ_DAYS[frequency] ?? 30));
  return { ms: d.getTime(), display: d.toLocaleDateString("es-AR", { day: "numeric", month: "short" }) };
}

type Action =
  | { type: "add"; item: RecurringRow & { pending: true } }
  | { type: "pay"; id: string }
  | { type: "remove"; id: string };

function reducer(state: (RecurringRow & { pending?: boolean })[], action: Action) {
  switch (action.type) {
    case "add":
      return [...state, action.item].sort((a, b) => a.nextDueDateMs - b.nextDueDateMs);
    case "pay":
      return state.map(i => {
        if (i.id !== action.id) return i;
        const freqMult = i.frequency === "monthly" ? 1 : 1;
        const advanceDays = FREQ_DAYS[i.frequency] ?? 30;
        const next = new Date(i.nextDueDateMs);
        if (i.dayOfMonth && i.frequency === "monthly") {
          next.setMonth(next.getMonth() + 1);
        } else {
          next.setDate(next.getDate() + advanceDays);
        }
        return {
          ...i,
          nextDueDateMs: next.getTime(),
          nextDueDate: next.toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
          pending: true as const,
        };
      });
    case "remove":
      return state.filter(i => i.id !== action.id);
  }
}

function AddForm({
  onDone,
  onAdd,
}: {
  onDone: () => void;
  onAdd: (item: RecurringRow & { pending: true }, fd: FormData) => void;
}) {
  const [freq, setFreq] = useState("monthly");

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const dayRaw = fd.get("dayOfMonth") as string;
    const dayOfMonth = dayRaw ? parseInt(dayRaw) : null;
    const frequency = fd.get("frequency") as string || "monthly";
    const { ms, display } = computeNextDue(frequency, dayOfMonth);

    const optimisticItem: RecurringRow & { pending: true } = {
      id: `opt-${Date.now()}`,
      name: fd.get("name") as string,
      amount: parseFloat(fd.get("amount") as string) || 0,
      category: fd.get("category") as string,
      frequency: frequency as RecurringRow["frequency"],
      dayOfMonth,
      nextDueDate: display,
      nextDueDateMs: ms,
      blockId: undefined,
      note: (fd.get("note") as string) || undefined,
      pending: true,
    };

    onAdd(optimisticItem, fd);
    onDone();
  };

  return (
    <form onSubmit={save} style={{ padding: "20px 0", borderBottom: "1px solid var(--hairline)", display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: `1fr 1fr 1fr${freq === "monthly" ? " 80px" : ""}`, gap: 10 }}>
        <div>
          <div className="mono" style={labelStyle}>Nombre</div>
          <input name="name" required placeholder="Spotify, Alquiler…" style={fieldStyle} />
        </div>
        <div>
          <div className="mono" style={labelStyle}>Importe</div>
          <input name="amount" type="number" required placeholder="0.00" style={fieldStyle} />
        </div>
        <div>
          <div className="mono" style={labelStyle}>Frecuencia</div>
          <select name="frequency" value={freq} onChange={e => setFreq(e.target.value)} style={fieldStyle}>
            {FREQS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>
        {freq === "monthly" && (
          <div>
            <div className="mono" style={labelStyle}>Día</div>
            <input
              name="dayOfMonth" type="number" min="1" max="31"
              placeholder="15" style={fieldStyle}
              title="Día fijo del mes en que se debita"
            />
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "flex-end" }}>
        <div>
          <div className="mono" style={labelStyle}>Categoría</div>
          <select name="category" style={fieldStyle}>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <div className="mono" style={labelStyle}>Nota</div>
          <input name="note" placeholder="Opcional" style={fieldStyle} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={onDone} style={{
            padding: "9px 14px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "none", fontFamily: "inherit", fontSize: 12, color: "var(--mute)",
          }}>Cancelar</button>
          <button type="submit" style={{
            padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "var(--ink)", color: "var(--inverse)",
            fontFamily: "inherit", fontSize: 12, fontWeight: 500,
          }}>
            Agregar
          </button>
        </div>
      </div>
    </form>
  );
}

function RecurringRowItem({
  item,
  onPay,
  onDelete,
}: {
  item: RecurringRow & { pending?: boolean };
  onPay: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const freqLabel = FREQS.find(f => f.id === item.frequency)?.label ?? item.frequency;
  const daysUntil = Math.ceil((item.nextDueDateMs - Date.now()) / (1000 * 60 * 60 * 24));
  const urgent = daysUntil <= 5;
  const debitLabel = item.dayOfMonth ? `${freqLabel} · el ${item.dayOfMonth}` : freqLabel;

  return (
    <div className="row-hover" style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 0", borderBottom: "1px solid var(--hairline)",
      opacity: item.pending ? 0.55 : 1,
      transition: "opacity 200ms",
    }}>
      <div style={{ width: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Glyph kind={CATEGORY_GLYPH[item.category] ?? "ring"} size={14} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em" }}>{item.name}</div>
        <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 3 }}>
          {item.category} · {debitLabel}
        </div>
      </div>

      <div className="mono" style={{
        fontSize: 11, letterSpacing: "0.04em",
        color: urgent ? "var(--ink)" : "var(--faint)",
        fontWeight: urgent ? 500 : 400,
        flexShrink: 0,
      }}>
        {daysUntil <= 0 ? "Hoy" : daysUntil === 1 ? "Mañana" : item.nextDueDate}
      </div>

      <div className="display tnum" style={{
        fontSize: 15, fontWeight: 500, color: "var(--ink)",
        letterSpacing: "-0.025em", flexShrink: 0, minWidth: 80, textAlign: "right",
      }}>
        ${item.amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </div>

      <button
        onClick={() => !item.pending && onPay(item.id)}
        disabled={!!item.pending}
        title="Marcar como pagado"
        style={{
          padding: "6px 12px", borderRadius: 7, border: "none",
          cursor: item.pending ? "default" : "pointer",
          background: "var(--surface)", fontFamily: "inherit", fontSize: 11,
          color: "var(--mute)", letterSpacing: "-0.005em", flexShrink: 0,
          boxShadow: "inset 0 0 0 1px var(--hairline)", transition: "all 120ms ease",
        }}>
        Pagar
      </button>

      <button
        onClick={() => !item.pending && onDelete(item.id)}
        disabled={!!item.pending}
        title="Eliminar"
        style={{
          background: "none", border: "none", cursor: item.pending ? "default" : "pointer",
          color: "var(--whisper)", fontSize: 18, lineHeight: 1, padding: "0 4px",
          flexShrink: 0, transition: "color 120ms ease",
        }}
        onMouseEnter={e => !item.pending && (e.currentTarget.style.color = "var(--faint)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--whisper)")}>
        ×
      </button>
    </div>
  );
}

export function RecurringClient({ items }: { items: RecurringRow[] }) {
  const [adding, setAdding] = useState(false);
  const [isPending, start] = useTransition();
  const [optimisticItems, dispatch] = useOptimistic(items, reducer);

  const totalMonthly = optimisticItems.reduce((s, i) => {
    const mult = i.frequency === "weekly" ? 4.3 : i.frequency === "bimonthly" ? 0.5 : i.frequency === "yearly" ? 1 / 12 : 1;
    return s + i.amount * mult;
  }, 0);

  const handleAdd = (optimisticItem: RecurringRow & { pending: true }, fd: FormData) => {
    start(async () => {
      dispatch({ type: "add", item: optimisticItem });
      await createRecurring(fd);
    });
  };

  const handlePay = (id: string) => {
    start(async () => {
      dispatch({ type: "pay", id });
      await markRecurringPaid(id);
    });
  };

  const handleDelete = (id: string) => {
    start(async () => {
      dispatch({ type: "remove", id });
      await deleteRecurring(id);
    });
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px 80px" }}>
      <header style={{ paddingBottom: 28, borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
            Compromisos
          </div>
          <h1 className="display" style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em", color: "var(--ink)", lineHeight: 1 }}>
            Recurrentes
          </h1>
        </div>
        <div style={{ textAlign: "right" }}>
          {totalMonthly > 0 && (
            <>
              <div className="display tnum" style={{ fontSize: 24, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.04em" }}>
                ${Math.round(totalMonthly).toLocaleString("en-US")}
              </div>
              <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", marginTop: 4 }}>
                EQUIVALENTE MENSUAL
              </div>
            </>
          )}
        </div>
      </header>

      <div style={{ marginTop: 8 }}>
        {adding && <AddForm onDone={() => setAdding(false)} onAdd={handleAdd} />}

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

        {optimisticItems.length === 0 && !adding ? (
          <div className="mono" style={{ fontSize: 11, color: "var(--faint)", padding: "32px 0" }}>
            Sin recurrentes. Suscripciones, servicios, alquiler — agregá todo lo que se cobra solo.
          </div>
        ) : (
          optimisticItems.map(item => (
            <RecurringRowItem
              key={item.id}
              item={item}
              onPay={handlePay}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
