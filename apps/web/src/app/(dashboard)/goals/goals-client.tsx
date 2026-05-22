"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useGoals, useCompletedGoals } from "@/hooks/queries";
import { useCreateGoal, useContributeToGoal, useDeleteGoal, useUpdateGoal } from "@/hooks/mutations";
import { useCurrency } from "@/hooks/use-currency";
import { AmountInput } from "@/components/ui/amount-input";
import { DatePicker } from "@/components/ui/date-picker";
import { parseNumeric } from "@/hooks/use-number-input";
import { springGentle } from "@/components/motion/presets";
import type { GoalRow } from "@/hooks/queries";

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

function GoalCard({ goal, readonly }: { goal: GoalRow; readonly?: boolean }) {
  const [contributing, setContributing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState("");
  const [editName, setEditName] = useState(goal.name);
  const [editTarget, setEditTarget] = useState(String(goal.targetAmount));
  const [editDeadline, setEditDeadline] = useState(goal.deadlineISO ?? "");
  const { format } = useCurrency();
  const contribute = useContributeToGoal();
  const del = useDeleteGoal();
  const upd = useUpdateGoal();

  const r = 22;
  const c = 2 * Math.PI * r;
  const isOpt = goal.id.startsWith("opt-");

  const handleContribute = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const n = parseNumeric(amount);
    if (!n || n <= 0) return;
    const fd = new FormData();
    fd.set("id", goal.id);
    fd.set("amount", String(n));
    contribute.mutate(fd, {
      onSuccess: () => {
        setContributing(false);
        setAmount("");
      },
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmt = parseNumeric(editTarget);
    if (!editName.trim() || targetAmt <= 0) return;
    upd.mutate(
      { id: goal.id, name: editName.trim(), targetAmount: targetAmt, deadline: editDeadline || null },
      { onSuccess: () => setEditing(false) },
    );
  };

  if (editing) {
    return (
      <form onSubmit={handleEdit} style={{
        padding: "20px 0", borderBottom: "1px solid var(--hairline)", display: "grid", gap: 12,
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 120px auto", gap: 10, alignItems: "flex-end" }}>
          <div>
            <div className="mono" style={labelStyle}>Nombre</div>
            <input value={editName} onChange={e => setEditName(e.target.value)} required style={fieldStyle} />
          </div>
          <div>
            <div className="mono" style={labelStyle}>Meta</div>
            <AmountInput value={editTarget} onChange={setEditTarget} required style={fieldStyle} />
          </div>
          <div>
            <div className="mono" style={labelStyle}>Fecha límite</div>
            <DatePicker value={editDeadline} onChange={setEditDeadline} placeholder="Fecha límite" style={fieldStyle} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => setEditing(false)} style={{
              padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: "none", fontFamily: "inherit", fontSize: 12, color: "var(--mute)",
            }}>Cancelar</button>
            <button type="submit" disabled={upd.isPending} style={{
              padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer",
              background: upd.isPending ? "var(--surface)" : "var(--ink)",
              color: upd.isPending ? "var(--faint)" : "var(--inverse)",
              fontFamily: "inherit", fontSize: 12, fontWeight: 500,
            }}>Guardar</button>
          </div>
        </div>
        {upd.isError && (
          <div style={{
            padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.05)",
            fontSize: 12, color: "var(--ink)", fontFamily: "inherit",
          }}>
            {upd.error?.message || "Algo salió mal. Intentá de nuevo."}
          </div>
        )}
      </form>
    );
  }

  return (
    <div style={{ padding: "24px 0", borderBottom: "1px solid var(--hairline)", opacity: isOpt ? 0.55 : 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Radial ring */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={52} height={52} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={26} cy={26} r={r} fill="none" stroke="var(--hairline2)" strokeWidth={1.6} />
            <circle cx={26} cy={26} r={r} fill="none" stroke="var(--ink)" strokeWidth={1.6}
              strokeLinecap="round" strokeDasharray={c}
              strokeDashoffset={c * (1 - goal.pct / 100)}
              style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(.2,.7,.1,1)" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="display tnum" style={{ fontSize: 11, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.02em" }}>
              {goal.pct}%
            </span>
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.01em", marginBottom: 3 }}>
            {goal.name}
          </div>
          <div className="display tnum" style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.03em" }}>
            {format(goal.currentAmount)}
            <span style={{ color: "var(--faint)", fontSize: 12, fontWeight: 400 }}>
              {" "}/ {format(goal.targetAmount)}
            </span>
          </div>
          {goal.deadline && (
            <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>
              Límite · {goal.deadline}
            </div>
          )}
          {/* Progress bar */}
          <div style={{ height: 2, background: "var(--hairline)", borderRadius: 99, overflow: "hidden", marginTop: 10 }}>
            <div style={{
              height: "100%", width: `${goal.pct}%`,
              background: "var(--ink)", borderRadius: 99,
              transition: "width 0.6s cubic-bezier(.2,.7,.1,1)",
            }} />
          </div>
        </div>

        {/* Actions */}
        {!readonly && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "flex-start" }}>
            <button onClick={() => setContributing(v => !v)} style={{
              padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer",
              background: "var(--ink)", color: "var(--inverse)",
              fontFamily: "inherit", fontSize: 11, fontWeight: 500, letterSpacing: "-0.005em",
            }}>
              + Aportar
            </button>
            <button
              onClick={() => !isOpt && setEditing(true)}
              disabled={isOpt}
              style={{
                padding: "6px 10px", background: "none", border: "none",
                cursor: isOpt ? "default" : "pointer",
                fontFamily: "inherit", fontSize: 11, color: "var(--mute)",
                borderBottom: "1px solid transparent",
              }}
            >Editar</button>
            <button
              onClick={() => !isOpt && del.mutate(goal.id)}
              disabled={isOpt || del.isPending}
              style={{
                padding: "6px 8px", background: "none", border: "none",
                cursor: isOpt || del.isPending ? "default" : "pointer",
                fontFamily: "inherit", fontSize: 11, color: "var(--mute)",
              }}
            >×</button>
          </div>
        )}
      </div>

      {contributing && (
        <form onSubmit={handleContribute} style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
                Monto a aportar
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ color: "var(--faint)", fontSize: 16 }}>$</span>
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
          </div>
          {contribute.isError && (
            <div style={{
              padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.05)",
              fontSize: 12, color: "var(--ink)", fontFamily: "inherit",
            }}>
              {contribute.error?.message || "Algo salió mal. Intentá de nuevo."}
            </div>
          )}
        </form>
      )}
    </div>
  );
}

function AddGoalForm({ onDone }: { onDone: () => void }) {
  const createGoal = useCreateGoal();
  const [deadline, setDeadline] = useState("");

  const save = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createGoal.mutate(fd, { onSuccess: () => onDone() });
  };

  return (
    <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div className="mono" style={labelStyle}>Nombre</div>
        <input name="name" required placeholder="Viaje Japón, Fondo emergencia…" style={fieldStyle} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div className="mono" style={labelStyle}>Meta</div>
          <AmountInput name="targetAmount" required placeholder="0" style={fieldStyle} />
        </div>
        <div>
          <div className="mono" style={labelStyle}>Inicial</div>
          <AmountInput name="currentAmount" placeholder="0" style={{ ...fieldStyle, color: "var(--mute)" }} />
        </div>
      </div>
      <div>
        <div className="mono" style={labelStyle}>Fecha límite</div>
        <DatePicker value={deadline} onChange={setDeadline} placeholder="Fecha límite" style={fieldStyle} />
        <input type="hidden" name="deadline" value={deadline} />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
        <button type="button" onClick={onDone} style={{
          padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer",
          background: "none", fontFamily: "inherit", fontSize: 12, color: "var(--mute)",
        }}>Cancelar</button>
        <button type="submit" disabled={createGoal.isPending} style={{
          padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer",
          background: createGoal.isPending ? "var(--surface)" : "var(--ink)",
          color: createGoal.isPending ? "var(--faint)" : "var(--inverse)",
          fontFamily: "inherit", fontSize: 12, fontWeight: 500,
        }}>
          {createGoal.isPending ? "…" : "Crear meta"}
        </button>
      </div>
      {createGoal.isError && (
        <div style={{
          padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.05)",
          fontSize: 12, color: "var(--ink)", fontFamily: "inherit",
        }}>
          {createGoal.error?.message || "Algo salió mal. Intentá de nuevo."}
        </div>
      )}
    </form>
  );
}

export function GoalsClient({ initialGoals }: { initialGoals: GoalRow[] }) {
  const [adding, setAdding] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const { data: goals } = useGoals(initialGoals);
  const { data: completedGoals } = useCompletedGoals();
  const { format } = useCurrency();

  const activeList = goals ?? [];
  const completedList = completedGoals ?? [];
  const list = showCompleted ? completedList : activeList;
  const totalSaved  = activeList.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = activeList.reduce((s, g) => s + g.targetAmount, 0);
  const overallPct  = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px 80px" }}>
      <header style={{ paddingBottom: 28, borderBottom: "1px solid var(--hairline)" }}>
        <motion.div
          className="mono"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.05 }}
          style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}
        >
          Metas
        </motion.div>
        <motion.h1
          className="display"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.1 }}
          style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em", color: "var(--ink)", lineHeight: 1 }}
        >
          Ahorro
        </motion.h1>
      </header>

      {/* Toggle: Activas / Completadas */}
      <div style={{ display: "flex", gap: 18, marginTop: 20, marginBottom: 4 }}>
        {(["activas", "completadas"] as const).map(tab => {
          const active = tab === "activas" ? !showCompleted : showCompleted;
          const count = tab === "activas" ? activeList.length : completedList.length;
          return (
            <button
              key={tab}
              onClick={() => setShowCompleted(tab === "completadas")}
              className="mono"
              style={{
                padding: "8px 0", background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 10, letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: active ? "var(--ink)" : "var(--faint)",
                borderBottom: active ? "1px solid var(--ink)" : "1px solid transparent",
                transition: "all 200ms ease",
              }}
            >
              {tab === "activas" ? "Activas" : "Completadas"} · {count}
            </button>
          );
        })}
      </div>

      {/* Metrics header — only for active goals */}
      {!showCompleted && totalTarget > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.15 }}
          style={{ padding: "28px 0", borderBottom: "1px solid var(--hairline)" }}
        >
          <div style={{ display: "flex", gap: 56, alignItems: "flex-start" }}>
            <div>
              <div className="mono" style={{
                fontSize: 9, color: "var(--mute)", letterSpacing: "0.14em",
                textTransform: "uppercase", marginBottom: 8,
              }}>
                Ahorrado vs metas
              </div>
              <div className="display tnum" style={{
                fontSize: 32, fontWeight: 500, color: "var(--ink)",
                letterSpacing: "-0.04em", lineHeight: 1,
              }}>
                {format(totalSaved)}
              </div>
            </div>
            <div>
              <div className="mono" style={{
                fontSize: 9, color: "var(--mute)", letterSpacing: "0.14em",
                textTransform: "uppercase", marginBottom: 8,
              }}>
                Meta total · {format(totalTarget)}  —  {overallPct}% del total
              </div>
              <div className="display tnum" style={{
                fontSize: 32, fontWeight: 500, color: "var(--faint)",
                letterSpacing: "-0.04em", lineHeight: 1,
              }}>
                {format(totalTarget)}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 2, background: "var(--hairline)", borderRadius: 99, overflow: "hidden", marginTop: 20 }}>
            <div style={{
              height: "100%", width: `${overallPct}%`,
              background: "var(--ink)", borderRadius: 99,
              transition: "width 0.8s cubic-bezier(.2,.7,.1,1)",
            }} />
          </div>
        </motion.div>
      )}

      {/* Goal grid */}
      <div style={{ marginTop: 8 }}>
        {!showCompleted && (
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

        {list.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "80px 0", gap: 16,
          }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.06em", textAlign: "center" }}>
              {showCompleted ? "Sin metas completadas aún." : "Sin metas de ahorro. Creá tu primera meta."}
            </div>
          </div>
        ) : (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "0 40px",
          }}>
            {list.map(g => <GoalCard key={g.id} goal={g} readonly={showCompleted} />)}
          </div>
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
              width: 540, maxWidth: "92vw",
              background: "var(--bg)", borderRadius: 16,
              boxShadow: "0 28px 80px rgba(0,0,0,0.32), 0 0 0 1px var(--hairline)",
              padding: "22px 24px 18px",
            }}
          >
            <AddGoalForm onDone={() => setAdding(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
