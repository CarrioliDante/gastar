"use client";

import { useState } from "react";
import { useGoals } from "@/hooks/queries";
import { useCreateGoal, useContributeToGoal, useDeleteGoal } from "@/hooks/mutations";
import { useCurrency } from "@/hooks/use-currency";
import { AmountInput } from "@/components/ui/amount-input";
import type { GoalRow } from "@/hooks/queries";

const fieldStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  background: "var(--surface)", border: "1px solid var(--hairline)",
  outline: "none", fontFamily: "inherit", fontSize: 13,
  color: "var(--ink)", letterSpacing: "-0.005em", boxSizing: "border-box",
};

function GoalCard({ goal }: { goal: GoalRow }) {
  const [contributing, setContributing] = useState(false);
  const [amount, setAmount] = useState("");
  const { format } = useCurrency();
  const contribute = useContributeToGoal();
  const del = useDeleteGoal();

  const r = 28, c = 2 * Math.PI * r;
  const isOpt = goal.id.startsWith("opt-");

  const handleContribute = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    const fd = new FormData();
    fd.set("id", goal.id);
    fd.set("amount", String(n));
    contribute.mutate(fd);
    setContributing(false);
    setAmount("");
  };

  return (
    <div style={{ padding: "28px 0 24px", borderBottom: "1px solid var(--hairline)", opacity: isOpt ? 0.55 : 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
        {/* Radial ring */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={64} height={64} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={32} cy={32} r={r} fill="none" stroke="var(--hairline2)" strokeWidth={1.6} />
            <circle cx={32} cy={32} r={r} fill="none" stroke="var(--ink)" strokeWidth={1.6}
              strokeLinecap="round" strokeDasharray={c}
              strokeDashoffset={c * (1 - goal.pct / 100)}
              style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(.2,.7,.1,1)" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="display tnum" style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.02em" }}>
              {goal.pct}%
            </span>
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.01em" }}>{goal.name}</div>
            {goal.deadline && (
              <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {goal.deadline}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 24, alignItems: "baseline", marginBottom: 14 }}>
            {[
              { value: goal.currentAmount, label: "Ahorrado" },
              { value: goal.targetAmount,  label: "Meta",     faint: true },
              { value: goal.remaining,     label: "Falta",    faint: true },
            ].map(({ value, label, faint }) => (
              <div key={label}>
                <div className="display tnum" style={{ fontSize: 22, fontWeight: faint ? 400 : 500, color: faint ? "var(--faint)" : "var(--ink)", letterSpacing: "-0.035em" }}>
                  {format(value)}
                </div>
                <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ height: 2, background: "var(--hairline)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${goal.pct}%`,
              background: "var(--ink)", borderRadius: 99,
              transition: "width 0.6s cubic-bezier(.2,.7,.1,1)",
            }} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => setContributing(v => !v)} style={{
            padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer",
            background: "var(--ink)", color: "var(--inverse)",
            fontFamily: "inherit", fontSize: 12, fontWeight: 500, letterSpacing: "-0.005em",
          }}>
            + Aportar
          </button>
          <button
            onClick={() => !isOpt && del.mutate(goal.id)}
            disabled={isOpt || del.isPending}
            style={{
              padding: "7px 10px", borderRadius: 7, border: "none",
              cursor: isOpt || del.isPending ? "default" : "pointer",
              background: "none", color: "var(--faint)",
              boxShadow: "inset 0 0 0 1px var(--hairline)",
              fontFamily: "inherit", fontSize: 12,
            }}
          >×</button>
        </div>
      </div>

      {contributing && (
        <form onSubmit={handleContribute} style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
              Monto a aportar
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ color: "var(--faint)", fontSize: 18 }}>$</span>
              <AmountInput
                value={amount} onChange={setAmount}
                placeholder="0" required autoFocus
                style={{ ...fieldStyle, flex: 1 }} />
            </div>
          </div>
          <button type="button" onClick={() => setContributing(false)} style={{
            padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "none", fontFamily: "inherit", fontSize: 12, color: "var(--mute)",
          }}>Cancelar</button>
          <button type="submit" disabled={contribute.isPending} style={{
            padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "var(--ink)", color: "var(--inverse)",
            fontFamily: "inherit", fontSize: 12, fontWeight: 500,
          }}>
            Confirmar
          </button>
        </form>
      )}
    </div>
  );
}

function AddGoalForm({ onDone }: { onDone: () => void }) {
  const createGoal = useCreateGoal();

  const save = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createGoal.mutate(fd);
    onDone();
  };

  return (
    <form onSubmit={save} style={{ padding: "16px 0", borderBottom: "1px solid var(--hairline)", display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px auto", gap: 10, alignItems: "flex-end" }}>
        <div>
          <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Nombre</div>
          <input name="name" required placeholder="Viaje Japón, Fondo emergencia…" style={fieldStyle} />
        </div>
        <div>
          <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Meta</div>
          <AmountInput name="targetAmount" required placeholder="0" style={fieldStyle} />
        </div>
        <div>
          <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Inicial</div>
          <AmountInput name="currentAmount" placeholder="0" style={{ ...fieldStyle, color: "var(--mute)" }} />
        </div>
        <div>
          <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Fecha límite</div>
          <input name="deadline" type="date" style={fieldStyle} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={onDone} style={{
            padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "none", fontFamily: "inherit", fontSize: 12, color: "var(--mute)",
          }}>Cancelar</button>
          <button type="submit" disabled={createGoal.isPending} style={{
            padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            background: createGoal.isPending ? "var(--surface)" : "var(--ink)",
            color: createGoal.isPending ? "var(--faint)" : "var(--inverse)",
            fontFamily: "inherit", fontSize: 12, fontWeight: 500,
          }}>
            {createGoal.isPending ? "…" : "Crear meta"}
          </button>
        </div>
      </div>
    </form>
  );
}

export function GoalsClient({ initialGoals }: { initialGoals: GoalRow[] }) {
  const [adding, setAdding] = useState(false);
  const { data: goals } = useGoals(initialGoals);
  const { format } = useCurrency();

  const list = goals ?? [];
  const totalSaved  = list.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = list.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px 80px" }}>
      <header style={{ paddingBottom: 28, borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
            Crecimiento
          </div>
          <h1 className="display" style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em", color: "var(--ink)", lineHeight: 1 }}>
            Metas de ahorro
          </h1>
        </div>
        {totalTarget > 0 && (
          <div style={{ textAlign: "right" }}>
            <div className="display tnum" style={{ fontSize: 22, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.04em" }}>
              {format(totalSaved)}
              <span style={{ color: "var(--faint)", fontSize: 14, fontWeight: 400 }}>
                {" "}/ {format(totalTarget)}
              </span>
            </div>
            <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", marginTop: 4 }}>
              TOTAL AHORRADO
            </div>
          </div>
        )}
      </header>

      <div style={{ marginTop: 8 }}>
        {adding && <AddGoalForm onDone={() => setAdding(false)} />}

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
            Nueva meta de ahorro
          </button>
        )}

        {list.length === 0 && !adding ? (
          <div className="mono" style={{ fontSize: 11, color: "var(--faint)", padding: "32px 0" }}>
            Sin metas. Creá objetivos de ahorro y registrá tus aportes desde acá.
          </div>
        ) : (
          list.map(g => <GoalCard key={g.id} goal={g} />)
        )}
      </div>
    </div>
  );
}
