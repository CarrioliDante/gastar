"use client";

import { useState } from "react";
import { useInstallments } from "@/hooks/queries";
import { useCreateInstallment, usePayInstallment, useDeleteInstallment } from "@/hooks/mutations";
import { useCurrency } from "@/hooks/use-currency";
import { AmountInput } from "@/components/ui/amount-input";
import type { InstallmentRow } from "@/hooks/queries";

type InstRow = InstallmentRow;

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
  const [total, setTotal] = useState("");
  const [n, setN] = useState("12");
  const [paid, setPaid] = useState("0");
  const { format } = useCurrency();
  const createInst = useCreateInstallment();

  const paidN = Math.max(0, parseInt(paid) || 0);
  const totalN = Math.max(1, parseInt(n) || 1);
  const remaining = Math.max(0, totalN - paidN);
  const monthlyAmt = total ? parseFloat(total) / totalN : 0;
  const monthly = monthlyAmt > 0 ? format(monthlyAmt) : "";

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const monthlyAmt = parseFloat(total) / totalN || 0;
    fd.set("monthlyAmount", monthlyAmt.toString());
    fd.set("paidInstallments", String(paidN));

    createInst.mutate(fd);
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
          <AmountInput
            name="totalAmount" required
            value={total} onChange={setTotal}
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, alignItems: "flex-end" }}>
        <div>
          <div className="mono" style={labelStyle}>Fecha inicio</div>
          <input name="startedAt" type="date" style={fieldStyle} />
        </div>
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
        <button type="submit" disabled={createInst.isPending} style={{
          padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer",
          background: createInst.isPending ? "var(--surface)" : "var(--ink)",
          color: createInst.isPending ? "var(--faint)" : "var(--inverse)",
          fontFamily: "inherit", fontSize: 12, fontWeight: 500,
        }}>Agregar cuota</button>
      </div>
    </form>
  );
}

function InstRowItem({ item }: { item: InstRow }) {
  const { format } = useCurrency();
  const pay = usePayInstallment();
  const del = useDeleteInstallment();

  const paidCount = item.total_installments - item.remaining;
  const pct = paidCount / item.total_installments;
  const r = 18, c = 2 * Math.PI * r;
  const isOpt = item.id.startsWith("opt-");
  const isDone = item.remaining === 0;

  return (
    <div className="row-hover" style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "18px 0", borderBottom: "1px solid var(--hairline)",
      opacity: isOpt ? 0.55 : 1,
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
          {format(item.monthly)}
        </div>
        <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 3 }}>/ mes</div>
      </div>

      {/* Actions */}
      <button
        onClick={() => !isOpt && !isDone && pay.mutate(item.id)}
        disabled={isOpt || isDone || pay.isPending}
        style={{
          padding: "7px 14px", borderRadius: 7, border: "none",
          cursor: isOpt || isDone || pay.isPending ? "default" : "pointer",
          background: "var(--surface)", fontFamily: "inherit", fontSize: 11,
          color: isDone || pay.isPending ? "var(--faint)" : "var(--mute)",
          boxShadow: "inset 0 0 0 1px var(--hairline)", flexShrink: 0,
        }}>
        {isDone ? "Completo" : "Pagar cuota"}
      </button>

      <button
        onClick={() => !isOpt && del.mutate(item.id)}
        disabled={isOpt || del.isPending}
        className="del-btn">×</button>
    </div>
  );
}

export function InstallmentsClient({ initialItems }: { initialItems: InstRow[] }) {
  const [adding, setAdding] = useState(false);
  const { data: items } = useInstallments(initialItems);
  const { format } = useCurrency();

  const list = items ?? [];
  const totalMonthly = list.reduce((s, i) => s + i.monthly, 0);
  const totalRemaining = list.reduce((s, i) => s + i.remaining * i.monthly, 0);

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
              {format(totalMonthly)}
              <span style={{ color: "var(--faint)", fontSize: 14, fontWeight: 400 }}>/mes</span>
            </div>
            <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", marginTop: 4 }}>
              {format(totalRemaining)} PENDIENTE TOTAL
            </div>
          </div>
        )}
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
            Agregar cuota
          </button>
        )}
        {list.length === 0 && !adding ? (
          <div className="mono" style={{ fontSize: 11, color: "var(--faint)", padding: "32px 0" }}>
            Sin cuotas activas. Registrá compras en cuotas para ver su impacto mensual.
          </div>
        ) : (
          list.map(item => <InstRowItem key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
