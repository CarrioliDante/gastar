"use client";

import { useState, useTransition } from "react";
import { createGoal, contributeToGoal, deleteGoal } from "@/app/actions/goals";
import type { GoalRow } from "@/lib/queries/goals";

const fieldStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  background: "var(--surface)", border: "1px solid var(--hairline)",
  outline: "none", fontFamily: "inherit", fontSize: 13,
  color: "var(--ink)", letterSpacing: "-0.005em", boxSizing: "border-box",
};

function GoalCard({ goal }: { goal: GoalRow }) {
  const [contributing, setContributing] = useState(false);
  const [amount, setAmount] = useState("");
  const [isPending, start] = useTransition();
  const [deleting, startDel] = useTransition();

  const r = 28, c = 2 * Math.PI * r;

  const contribute = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("id", goal.id);
    fd.set("amount", amount);
    start(async () => {
      await contributeToGoal(fd);
      setContributing(false);
      setAmount("");
    });
  };

  return (
    <div style={{
      padding: "28px 0 24px",
      borderBottom: "1px solid var(--hairline)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
        {/* Radial ring */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={64} height={64} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={32} cy={32} r={r} fill="none" stroke="var(--hairline2)" strokeWidth={1.6} />
            <circle cx={32} cy={32} r={r} fill="none" stroke="var(--ink)" strokeWidth={1.6}
              strokeLinecap="round" strokeDasharray={c}
              strokeDashoffset={c * (1 - goal.pct / 100)}
              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.2,.7,.1,1)" }} />
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
            <div>
              <div className="display tnum" style={{ fontSize: 22, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.035em" }}>
                ${goal.currentAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
              <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>Ahorrado</div>
            </div>
            <div>
              <div className="display tnum" style={{ fontSize: 22, fontWeight: 400, color: "var(--faint)", letterSpacing: "-0.035em" }}>
                ${goal.targetAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
              <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>Meta</div>
            </div>
            <div>
              <div className="display tnum" style={{ fontSize: 22, fontWeight: 400, color: "var(--faint)", letterSpacing: "-0.035em" }}>
                ${goal.remaining.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
              <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>Falta</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 2, background: "var(--hairline)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${goal.pct}%`,
              background: "var(--ink)", borderRadius: 99,
              transition: "width 1.2s cubic-bezier(.2,.7,.1,1)",
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
          <button onClick={() => startDel(() => deleteGoal(goal.id))} disabled={deleting} style={{
            padding: "7px 10px", borderRadius: 7, border: "none", cursor: "pointer",
            background: "none", color: "var(--faint)",
            boxShadow: "inset 0 0 0 1px var(--hairline)",
            fontFamily: "inherit", fontSize: 12,
          }}>×</button>
        </div>
      </div>

      {/* Contribute form */}
      {contributing && (
        <form onSubmit={contribute} style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
              Monto a aportar
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ color: "var(--faint)", fontSize: 18 }}>$</span>
              <input
                type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0" required autoFocus
                style={{ ...fieldStyle, flex: 1 }} />
            </div>
          </div>
          <button type="button" onClick={() => setContributing(false)} style={{
            padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "none", fontFamily: "inherit", fontSize: 12, color: "var(--mute)",
          }}>Cancelar</button>
          <button type="submit" disabled={isPending} style={{
            padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "var(--ink)", color: "var(--inverse)",
            fontFamily: "inherit", fontSize: 12, fontWeight: 500,
          }}>
            {isPending ? "…" : "Confirmar"}
          </button>
        </form>
      )}
    </div>
  );
}

function AddGoalForm({ onDone }: { onDone: () => void }) {
  const [isPending, start] = useTransition();
  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => { await createGoal(fd); onDone(); });
  };

  return (
    <form onSubmit={save} style={{ padding: "16px 0", borderBottom: "1px solid var(--hairline)", display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10, alignItems: "flex-end" }}>
        <div>
          <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Nombre</div>
          <input name="name" required placeholder="Viaje Japón, Fondo emergencia…" style={fieldStyle} />
        </div>
        <div>
          <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Meta</div>
          <input name="targetAmount" type="number" required placeholder="0" style={fieldStyle} />
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
          <button type="submit" disabled={isPending} style={{
            padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "var(--ink)", color: "var(--inverse)",
            fontFamily: "inherit", fontSize: 12, fontWeight: 500,
          }}>
            {isPending ? "…" : "Crear meta"}
          </button>
        </div>
      </div>
    </form>
  );
}

export function GoalsClient({ goals }: { goals: GoalRow[] }) {
  const [adding, setAdding] = useState(false);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

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
              ${totalSaved.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              <span style={{ color: "var(--faint)", fontSize: 14, fontWeight: 400 }}>
                {" "}/ ${totalTarget.toLocaleString("en-US", { maximumFractionDigits: 0 })}
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

        {goals.length === 0 && !adding ? (
          <div className="mono" style={{ fontSize: 11, color: "var(--faint)", padding: "32px 0" }}>
            Sin metas. Creá objetivos de ahorro y registrá tus aportes desde acá.
          </div>
        ) : (
          goals.map(g => <GoalCard key={g.id} goal={g} />)
        )}
      </div>
    </div>
  );
}
