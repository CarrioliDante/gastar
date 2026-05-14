"use client";

import { useState, useTransition, useOptimistic } from "react";
import { createInstallment, payInstallment, deleteInstallment } from "@/app/actions/installments";

type InstRow = {
  id: string; name: string; total: number; paid: number;
  remaining: number; total_installments: number; monthly: number; next_due: string;
  pending?: boolean;
};

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

type Action =
  | { type: "add"; item: InstRow }
  | { type: "pay"; id: string }
  | { type: "remove"; id: string };

function reducer(state: InstRow[], action: Action): InstRow[] {
  switch (action.type) {
    case "add":
      return [...state, action.item];
    case "pay":
      return state.map(i => {
        if (i.id !== action.id) return i;
        const newRemaining = Math.max(0, i.remaining - 1);
        const paidCount = i.total_installments - newRemaining;
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return {
          ...i,
          remaining: newRemaining,
          paid: paidCount * i.monthly,
          next_due: nextMonth.toLocaleDateString("es-AR", { month: "short", day: "numeric" }),
          pending: true,
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
  onAdd: (item: InstRow, fd: FormData) => void;
}) {
  const [total, setTotal] = useState("");
  const [n, setN] = useState("12");
  const [paid, setPaid] = useState("0");

  const paidN = Math.max(0, parseInt(paid) || 0);
  const totalN = Math.max(1, parseInt(n) || 1);
  const remaining = Math.max(0, totalN - paidN);
  const monthly = total && n ? (parseFloat(total) / totalN).toFixed(2) : "";

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const monthlyAmt = parseFloat(total) / totalN;
    fd.set("monthlyAmount", monthlyAmt.toString());
    fd.set("paidInstallments", String(paidN));

    const nextDueDateRaw = fd.get("nextDueDate") as string;
    const nextDue = nextDueDateRaw
      ? new Date(nextDueDateRaw).toLocaleDateString("es-AR", { month: "short", day: "numeric" })
      : new Date().toLocaleDateString("es-AR", { month: "short", day: "numeric" });

    const optimisticItem: InstRow = {
      id: `opt-${Date.now()}`,
      name: fd.get("name") as string,
      total: parseFloat(total) || 0,
      paid: paidN * monthlyAmt,
      remaining,
      total_installments: totalN,
      monthly: monthlyAmt,
      next_due: nextDue,
      pending: true,
    };

    onAdd(optimisticItem, fd);
    onDone();
  };

  return (
    <form onSubmit={save} style={{ padding: "18px 0", borderBottom: "1px solid var(--hairline)", display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10 }}>
        <div>
          <div className="mono" style={labelStyle}>Nombre</div>
          <input name="name" required placeholder="iPhone, Notebook, Silla…" style={fieldStyle} />
        </div>
        <div>
          <div className="mono" style={labelStyle}>Total</div>
          <input
            name="totalAmount" type="number" required
            value={total} onChange={e => setTotal(e.target.value)}
            placeholder="0" style={fieldStyle}
          />
        </div>
        <div>
          <div className="mono" style={labelStyle}>Cuotas</div>
          <input
            name="totalInstallments" type="number" required
            value={n} onChange={e => setN(e.target.value)}
            min="2" max="72" style={fieldStyle}
          />
        </div>
        <div>
          <div className="mono" style={labelStyle}>Ya pagadas</div>
          <input
            name="paidInstallments" type="number"
            value={paid} onChange={e => setPaid(e.target.value)}
            min="0" max={totalN - 1} placeholder="0" style={fieldStyle}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignItems: "flex-end" }}>
        <div>
          <div className="mono" style={labelStyle}>Próximo venc.</div>
          <input name="nextDueDate" type="date" style={fieldStyle} />
        </div>
        <div>
          {monthly && (
            <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.06em", padding: "9px 0" }}>
              ${monthly} / mes
              {paidN > 0 ? ` · ${paidN} pagadas · quedan ${remaining}` : ` · ${totalN} cuotas`}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={onDone} style={{
          padding: "9px 14px", borderRadius: 8, border: "none", cursor: "pointer",
          background: "none", fontFamily: "inherit", fontSize: 12, color: "var(--mute)",
        }}>Cancelar</button>
        <button type="submit" style={{
          padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer",
          background: "var(--ink)", color: "var(--inverse)",
          fontFamily: "inherit", fontSize: 12, fontWeight: 500,
        }}>Agregar cuota</button>
      </div>
    </form>
  );
}

function InstRowItem({
  item,
  onPay,
  onDelete,
}: {
  item: InstRow;
  onPay: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const paidCount = item.total_installments - item.remaining;
  const pct = paidCount / item.total_installments;
  const r = 18, c = 2 * Math.PI * r;

  return (
    <div className="row-hover" style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "18px 0", borderBottom: "1px solid var(--hairline)",
      opacity: item.pending ? 0.55 : 1,
      transition: "opacity 200ms",
    }}>
      {/* Radial mini */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width={40} height={40} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={20} cy={20} r={r} fill="none" stroke="var(--hairline2)" strokeWidth={1.4} />
          <circle cx={20} cy={20} r={r} fill="none" stroke="var(--ink)" strokeWidth={1.4}
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="mono" style={{ fontSize: 9, color: "var(--ink)", fontWeight: 500 }}>
            {Math.round(pct * 100)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em", marginBottom: 4 }}>
          {item.name}
        </div>
        <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em" }}>
          {paidCount}/{item.total_installments} pagadas · vence {item.next_due}
        </div>
        <div style={{ marginTop: 10, height: 2, background: "var(--hairline)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct * 100}%`, background: "var(--ink)", borderRadius: 99 }} />
        </div>
      </div>

      {/* Amounts */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div className="display tnum" style={{ fontSize: 16, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.025em" }}>
          ${item.monthly.toLocaleString("en-US")}
        </div>
        <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 3 }}>/ mes</div>
      </div>

      {/* Actions */}
      <button
        onClick={() => !item.pending && item.remaining > 0 && onPay(item.id)}
        disabled={!!item.pending || item.remaining === 0}
        style={{
          padding: "7px 14px", borderRadius: 7, border: "none",
          cursor: item.pending || item.remaining === 0 ? "default" : "pointer",
          background: "var(--surface)", fontFamily: "inherit", fontSize: 11,
          color: item.remaining > 0 && !item.pending ? "var(--mute)" : "var(--faint)",
          boxShadow: "inset 0 0 0 1px var(--hairline)", flexShrink: 0,
        }}>
        {item.remaining === 0 ? "Completo" : "Pagar cuota"}
      </button>

      <button
        onClick={() => !item.pending && onDelete(item.id)}
        disabled={!!item.pending}
        className="del-btn">×</button>
    </div>
  );
}

export function InstallmentsClient({ items }: { items: InstRow[] }) {
  const [adding, setAdding] = useState(false);
  const [, start] = useTransition();
  const [optimisticItems, dispatch] = useOptimistic(items, reducer);

  const totalMonthly = optimisticItems.reduce((s, i) => s + i.monthly, 0);
  const totalRemaining = optimisticItems.reduce((s, i) => s + i.remaining * i.monthly, 0);

  const handleAdd = (item: InstRow, fd: FormData) => {
    start(async () => {
      dispatch({ type: "add", item });
      await createInstallment(fd);
    });
  };

  const handlePay = (id: string) => {
    start(async () => {
      dispatch({ type: "pay", id });
      await payInstallment(id);
    });
  };

  const handleDelete = (id: string) => {
    start(async () => {
      dispatch({ type: "remove", id });
      await deleteInstallment(id);
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
            Cuotas
          </h1>
        </div>
        {totalMonthly > 0 && (
          <div style={{ textAlign: "right" }}>
            <div className="display tnum" style={{ fontSize: 22, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.04em" }}>
              ${totalMonthly.toLocaleString("en-US")}
              <span style={{ color: "var(--faint)", fontSize: 14, fontWeight: 400 }}>/mes</span>
            </div>
            <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", marginTop: 4 }}>
              ${totalRemaining.toLocaleString("en-US")} PENDIENTE TOTAL
            </div>
          </div>
        )}
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
            Agregar cuota
          </button>
        )}
        {optimisticItems.length === 0 && !adding ? (
          <div className="mono" style={{ fontSize: 11, color: "var(--faint)", padding: "32px 0" }}>
            Sin cuotas activas. Registrá compras en cuotas para ver su impacto mensual.
          </div>
        ) : (
          optimisticItems.map(item => (
            <InstRowItem
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
