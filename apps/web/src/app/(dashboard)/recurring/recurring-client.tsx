"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRecurring } from "@/hooks/queries";
import { useCreateRecurring, usePayRecurring, useDeleteRecurring } from "@/hooks/mutations";
import { Glyph, CATEGORY_GLYPH } from "@/components/ui/glyph";
import { useCurrency } from "@/hooks/use-currency";
import { AmountInput } from "@/components/ui/amount-input";
import { springGentle } from "@/components/motion/presets";
import type { RecurringRow } from "@/hooks/queries";

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

function AddForm({ onDone }: { onDone: () => void }) {
  const [freq, setFreq] = useState("monthly");
  const createRec = useCreateRecurring();

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createRec.mutate(fd);
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
          <AmountInput name="amount" required placeholder="0" style={fieldStyle} />
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

function RecurringRowItem({ item }: { item: RecurringRow }) {
  const { format } = useCurrency();
  const pay = usePayRecurring();
  const del = useDeleteRecurring();

  const freqLabel = FREQS.find(f => f.id === item.frequency)?.label ?? item.frequency;
  const daysUntil = Math.ceil((item.nextDueDateMs - Date.now()) / (1000 * 60 * 60 * 24));
  const urgent = daysUntil <= 5;
  const isOpt = item.id.startsWith("opt-");
  const debitLabel = item.dayOfMonth ? `${freqLabel} · el ${item.dayOfMonth}` : freqLabel;

  return (
    <div className="row-hover" style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 0", borderBottom: "1px solid var(--hairline)",
      opacity: isOpt ? 0.55 : 1,
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
        {format(item.amount)}
      </div>

      <button
        onClick={() => !isOpt && pay.mutate(item.id)}
        disabled={isOpt || pay.isPending}
        title="Marcar como pagado"
        style={{
          padding: "6px 12px", borderRadius: 7, border: "none",
          cursor: isOpt || pay.isPending ? "default" : "pointer",
          background: "var(--surface)", fontFamily: "inherit", fontSize: 11,
          color: "var(--mute)", letterSpacing: "-0.005em", flexShrink: 0,
          boxShadow: "inset 0 0 0 1px var(--hairline)", transition: "all 120ms ease",
        }}>
        Pagar
      </button>

      <button
        onClick={() => !isOpt && del.mutate(item.id)}
        disabled={isOpt || del.isPending}
        title="Eliminar"
        style={{
          background: "none", border: "none", cursor: isOpt || del.isPending ? "default" : "pointer",
          color: "var(--whisper)", fontSize: 18, lineHeight: 1, padding: "0 4px",
          flexShrink: 0, transition: "color 120ms ease",
        }}
        onMouseEnter={e => !isOpt && !del.isPending && (e.currentTarget.style.color = "var(--faint)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--whisper)")}>
        ×
      </button>
    </div>
  );
}

export function RecurringClient({ initialItems }: { initialItems: RecurringRow[] }) {
  const [adding, setAdding] = useState(false);
  const { data: items } = useRecurring(initialItems);
  const { format } = useCurrency();

  const list = items ?? [];
  const totalMonthly = list.reduce((s, i) => {
    const mult = i.frequency === "weekly" ? 4.3 : i.frequency === "bimonthly" ? 0.5 : i.frequency === "yearly" ? 1 / 12 : 1;
    return s + i.amount * mult;
  }, 0);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px 80px" }}>
      <header style={{ paddingBottom: 28, borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <motion.div
            className="mono"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springGentle, delay: 0.05 }}
            style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}
          >
            Compromisos
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
        </div>
        <div style={{ textAlign: "right" }}>
          {totalMonthly > 0 && (
            <>
              <div className="display tnum" style={{ fontSize: 24, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.04em" }}>
                {format(Math.round(totalMonthly))}
              </div>
              <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", marginTop: 4 }}>
                EQUIVALENTE MENSUAL
              </div>
            </>
          )}
        </div>
      </header>

      <div style={{ marginTop: 8 }}>
        {adding && <AddForm onDone={() => setAdding(false)} />}

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

        {list.length === 0 && !adding ? (
          <div className="mono" style={{ fontSize: 11, color: "var(--faint)", padding: "32px 0" }}>
            Sin recurrentes. Suscripciones, servicios, alquiler — agregá todo lo que se cobra solo.
          </div>
        ) : (
          list.map(item => <RecurringRowItem key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
