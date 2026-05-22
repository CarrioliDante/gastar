"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useInstallments } from "@/hooks/queries";
import { useCreateInstallment, usePayInstallment, useDeleteInstallment, useUpdateInstallment } from "@/hooks/mutations";
import { useCurrency } from "@/hooks/use-currency";
import { AmountInput } from "@/components/ui/amount-input";
import { DatePicker } from "@/components/ui/date-picker";
import { Stat } from "@/components/ui/primitives";
import { parseNumeric } from "@/hooks/use-number-input";
import { springGentle } from "@/components/motion/presets";
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
  const [startedAt, setStartedAt] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const { format } = useCurrency();
  const createInst = useCreateInstallment();

  const paidN = Math.max(0, parseInt(paid) || 0);
  const totalN = Math.max(1, parseInt(n) || 1);
  const remaining = Math.max(0, totalN - paidN);
  const monthlyAmt = total ? parseNumeric(total) / totalN : 0;
  const monthly = monthlyAmt > 0 ? format(monthlyAmt) : "";

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const monthlyAmt = parseNumeric(total) / totalN || 0;
    fd.set("monthlyAmount", monthlyAmt.toString());
    fd.set("paidInstallments", String(paidN));

    createInst.mutate(fd, { onSuccess: () => onDone() });
  };

  return (
    <form onSubmit={save} style={{ display: "grid", gap: 12, width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)", gap: 10 }}>
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
          <DatePicker value={startedAt} onChange={setStartedAt} placeholder="Fecha inicio" style={fieldStyle} />
          <input type="hidden" name="startedAt" value={startedAt} />
        </div>
        <div>
          <div className="mono" style={labelStyle}>Próximo venc.</div>
          <DatePicker value={nextDueDate} onChange={setNextDueDate} placeholder="Próximo venc." style={fieldStyle} />
          <input type="hidden" name="nextDueDate" value={nextDueDate} />
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

      {createInst.isError && (
        <div style={{
          padding: "9px 12px", borderRadius: 8,
          background: "rgba(0,0,0,0.05)",
          fontSize: 12, color: "var(--ink)",
          fontFamily: "inherit", letterSpacing: "-0.005em",
        }}>
          {createInst.error?.message || "Algo salió mal. Intentá de nuevo."}
        </div>
      )}

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
  const [editing, setEditing] = useState(false);
  const { format } = useCurrency();
  const pay = usePayInstallment();
  const del = useDeleteInstallment();
  const upd = useUpdateInstallment();

  const paidCount = item.total_installments - item.remaining;
  const pct = paidCount / item.total_installments;
  const isOpt = item.id.startsWith("opt-");
  const isDone = item.remaining === 0;

  const monthAbbrs = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const currentMonthIdx = new Date().getMonth();
  const nextDueStr = item.next_due.toLowerCase();
  let nextDueMonthIdx = -1;
  for (const abbr of monthAbbrs) {
    if (nextDueStr.startsWith(abbr)) {
      nextDueMonthIdx = monthAbbrs.indexOf(abbr);
      break;
    }
  }
  const paidThisPeriod = nextDueMonthIdx >= 0 && nextDueMonthIdx !== currentMonthIdx;

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
          <EditInstallmentForm
            item={item}
            paidCount={paidCount}
            onSave={(name, monthlyAmount, paidInstallments) => {
              upd.mutate(
                { id: item.id, name, monthlyAmount, paidInstallments },
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
          <div style={{ padding: "18px 0", borderBottom: "1px solid var(--hairline)" }}>
            <div className="row-hover" style={{
              display: "flex", alignItems: "center", gap: 16,
              opacity: isOpt ? 0.55 : 1,
              transition: "opacity 200ms",
            }}>
              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em", marginBottom: 4 }}>
                  {item.name}
                </div>
                <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em" }}>
                  {paidCount}/{item.total_installments} pagadas · vence {item.next_due}
                </div>
              </div>

              {/* Amounts */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div className="display tnum" style={{ fontSize: 16, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.025em" }}>
                  {format(item.monthly)}
                </div>
                <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 3 }}>/ mes</div>
              </div>

              {/* Status badge */}
              {isDone ? (
                <span className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", flexShrink: 0 }}>Completo</span>
              ) : paidThisPeriod ? (
                <span className="mono" style={{ fontSize: 9, color: "var(--mute)", letterSpacing: "0.06em", flexShrink: 0 }}>Pagada</span>
              ) : (
                <button
                  onClick={() => !isOpt && pay.mutate(item.id)}
                  disabled={isOpt || pay.isPending}
                  style={{
                    padding: "4px 8px", background: "none", border: "none",
                    cursor: isOpt || pay.isPending ? "default" : "pointer",
                    fontFamily: "inherit", fontSize: 10, letterSpacing: "0.04em",
                    color: pay.isPending ? "var(--faint)" : "var(--mute)",
                  }}>
                  {pay.isPending ? "..." : "Pagar cuota"}
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
                  color: "var(--mute)",
                }}>
                Editar
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
                }}>×</button>
            </div>

            {/* Segmented progress dots */}
            <div style={{ display: "flex", gap: 2, marginTop: 12 }}>
              {Array.from({ length: item.total_installments }).map((_, j) => (
                <div key={j} style={{
                  flex: 1, height: 3, borderRadius: 99,
                  background: j < paidCount ? "var(--ink)" : "var(--hairline2)",
                }} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EditInstallmentForm({
  item, paidCount, onSave, onCancel, isPending, error,
}: {
  item: InstRow;
  paidCount: number;
  onSave: (name: string, monthlyAmount: number, paidInstallments: number) => void;
  onCancel: () => void;
  isPending: boolean;
  error?: string;
}) {
  const [name, setName] = useState(item.name);
  const [monthly, setMonthly] = useState(String(item.monthly));
  const [paid, setPaid] = useState(String(paidCount));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const monthlyAmt = parseNumeric(monthly);
    const paidN = Math.max(0, parseInt(paid) || 0);
    if (!name.trim() || monthlyAmt <= 0) return;
    onSave(name.trim(), monthlyAmt, paidN);
  };

  return (
    <form onSubmit={handleSubmit} style={{
      padding: "16px 0", borderBottom: "1px solid var(--hairline)",
      display: "grid", gap: 10, width: "100%", minWidth: 0, boxSizing: "border-box",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)", gap: 10 }}>
        <div>
          <div className="mono" style={labelStyle}>Nombre</div>
          <input
            value={name} onChange={e => setName(e.target.value)}
            required style={fieldStyle}
          />
        </div>
        <div>
          <div className="mono" style={labelStyle}>Cuota mensual</div>
          <AmountInput
            value={monthly} onChange={setMonthly}
            required style={fieldStyle}
          />
        </div>
        <div>
          <div className="mono" style={labelStyle}>Ya pagadas</div>
          <input
            type="number" value={paid} onChange={e => setPaid(e.target.value)}
            min="0" max={item.total_installments - 1} style={fieldStyle}
          />
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

export function InstallmentsClient({ initialItems }: { initialItems: InstRow[] }) {
  const [adding, setAdding] = useState(false);
  const { data: items } = useInstallments(initialItems);

  const list = items ?? [];
  const totalMonthly = list.reduce((s, i) => s + i.monthly, 0);
  const totalRemaining = list.reduce((s, i) => s + i.remaining * i.monthly, 0);

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
            Cuotas
          </motion.h1>
        </div>
      </header>

      {list.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.15 }}
          style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
            padding: "24px 0", borderBottom: "1px solid var(--hairline)",
          }}
        >
          <Stat value={totalMonthly} label="Por mes" prefix="$" decimals={0} />
          <Stat value={totalRemaining} label="Pendiente total" prefix="$" decimals={0} />
          <Stat value={list.filter(i => i.remaining > 0).length} label="Activas" decimals={0} />
        </motion.div>
      )}

      <div style={{ marginTop: 8 }}>
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
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "80px 0", gap: 16,
          }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.06em", textAlign: "center" }}>
              Sin cuotas registradas. Agregá tu primera cuota en cuotas.
            </div>
          </div>
        ) : (
          list.map(item => <InstRowItem key={item.id} item={item} />)
        )}
      </div>

      {adding && (
        <div
          onMouseDown={() => setAdding(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.40)", backdropFilter: "blur(12px)",
            display: "flex", alignItems: "flex-start", justifyContent: "center",
            paddingTop: "10vh",
          }}
        >
          <div
            onMouseDown={e => e.stopPropagation()}
            style={{
              width: 720, maxWidth: "94vw",
              background: "var(--bg)", borderRadius: 16,
              boxShadow: "0 28px 80px rgba(0,0,0,0.32), 0 0 0 1px var(--hairline)",
              padding: "22px 24px 18px",
            }}
          >
            <AddForm onDone={() => setAdding(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
